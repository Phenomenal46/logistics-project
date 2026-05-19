/*
 * shipmentsService.js
 * Purpose: Handle shipment creation, listing, tracking, and status updates.
 * Why it exists: Shipment logic mixes inventory, status rules, and history.
 * Concurrency note: We use transactions + row locks to keep stock and status
 * in sync when multiple requests hit the same shipment or SKU.
 */

const { pool } = require('../db/pool');
const { withTransaction } = require('../db/transaction');
const { createError } = require('../utils/errors');
const { generateTrackingNumber } = require('../utils/trackingNumber');
const { isValidTransition, isTerminalStatus } = require('../utils/statusFlow');
const {
  reserveStock,
  releaseReservation,
  consumeReservation,
  returnToStock
} = require('./inventoryService');

function shouldReleaseOnCancel(currentStatus) {
  return currentStatus === 'BOOKED' || currentStatus === 'PACKED';
}

async function createShipment({
  originWarehouseId,
  destinationWarehouseId,
  itemSku,
  itemName,
  quantity,
  requestedDeliveryDate,
  note
}) {
  return withTransaction(async (client) => {
    // Reserve stock first so we never create a shipment without inventory.
    await reserveStock(client, {
      warehouseId: originWarehouseId,
      sku: itemSku,
      quantity
    });

    let trackingNumber = null;
    let shipmentRow = null;

    // Retry if a tracking number collides with an existing one.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      trackingNumber = generateTrackingNumber();

      const insertSql = `
        INSERT INTO shipments (
          tracking_number,
          origin_warehouse_id,
          destination_warehouse_id,
          item_sku,
          item_name,
          quantity,
          status,
          requested_delivery_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'BOOKED', $7)
        RETURNING id, tracking_number, status, created_at;
      `;

      try {
        const result = await client.query(insertSql, [
          trackingNumber,
          originWarehouseId,
          destinationWarehouseId,
          itemSku,
          itemName,
          quantity,
          requestedDeliveryDate
        ]);
        shipmentRow = result.rows[0];
        break;
      } catch (error) {
        if (error.code !== '23505') {
          throw error;
        }
      }
    }

    if (!shipmentRow) {
      throw createError(500, 'Failed to create a unique tracking number.');
    }

    const eventSql = `
      INSERT INTO shipment_events (shipment_id, status, note)
      VALUES ($1, 'BOOKED', $2);
    `;

    await client.query(eventSql, [
      shipmentRow.id,
      note || 'Shipment booked and stock reserved.'
    ]);

    return shipmentRow;
  });
}

async function listShipments({ status, limit, offset }) {
  const sql = `
    SELECT
      s.id,
      s.tracking_number,
      s.status,
      s.item_sku,
      s.item_name,
      s.quantity,
      s.created_at,
      s.requested_delivery_date,
      w1.name AS origin_name,
      w2.name AS destination_name,
      CASE
        WHEN s.status = 'DELAYED' THEN 1
        WHEN s.status = 'OUT_FOR_DELIVERY' THEN 2
        WHEN s.status IN ('IN_TRANSIT', 'AT_HUB') THEN 3
        ELSE 4
      END AS priority_rank
    FROM shipments s
    JOIN warehouses w1 ON w1.id = s.origin_warehouse_id
    JOIN warehouses w2 ON w2.id = s.destination_warehouse_id
    WHERE ($1::text IS NULL OR s.status = $1)
    ORDER BY priority_rank ASC, s.created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const result = await pool.query(sql, [status, limit, offset]);
  return result.rows;
}

async function getShipmentById(id) {
  const sql = `
    SELECT
      s.id,
      s.tracking_number,
      s.status,
      s.item_sku,
      s.item_name,
      s.quantity,
      s.requested_delivery_date,
      s.created_at,
      s.updated_at,
      s.version,
      w1.name AS origin_name,
      w2.name AS destination_name
    FROM shipments s
    JOIN warehouses w1 ON w1.id = s.origin_warehouse_id
    JOIN warehouses w2 ON w2.id = s.destination_warehouse_id
    WHERE s.id = $1;
  `;

  const result = await pool.query(sql, [id]);
  if (result.rowCount === 0) {
    throw createError(404, 'Shipment not found.');
  }

  return result.rows[0];
}

async function getShipmentByTracking(trackingNumber) {
  const shipmentSql = `
    SELECT
      s.id,
      s.tracking_number,
      s.status,
      s.item_sku,
      s.item_name,
      s.quantity,
      s.requested_delivery_date,
      s.created_at,
      s.updated_at,
      w1.name AS origin_name,
      w2.name AS destination_name
    FROM shipments s
    JOIN warehouses w1 ON w1.id = s.origin_warehouse_id
    JOIN warehouses w2 ON w2.id = s.destination_warehouse_id
    WHERE s.tracking_number = $1;
  `;

  const shipmentResult = await pool.query(shipmentSql, [trackingNumber]);
  if (shipmentResult.rowCount === 0) {
    throw createError(404, 'Shipment not found for this tracking number.');
  }

  const shipment = shipmentResult.rows[0];

  const eventsSql = `
    SELECT status, note, created_at
    FROM shipment_events
    WHERE shipment_id = $1
    ORDER BY created_at ASC;
  `;

  const eventsResult = await pool.query(eventsSql, [shipment.id]);

  return { shipment, events: eventsResult.rows };
}

async function updateStatus({ id, newStatus, note, expectedCurrentStatus }) {
  return withTransaction(async (client) => {
    const shipmentSql = `
      SELECT
        id,
        status,
        quantity,
        item_sku,
        origin_warehouse_id
      FROM shipments
      WHERE id = $1
      FOR UPDATE;
    `;

    const shipmentResult = await client.query(shipmentSql, [id]);
    if (shipmentResult.rowCount === 0) {
      throw createError(404, 'Shipment not found.');
    }

    const shipment = shipmentResult.rows[0];

    if (isTerminalStatus(shipment.status)) {
      throw createError(409, 'Shipment is already in a final state.');
    }

    if (expectedCurrentStatus && shipment.status !== expectedCurrentStatus) {
      throw createError(409, 'Shipment status changed. Please refresh and retry.');
    }

    if (!isValidTransition(shipment.status, newStatus)) {
      throw createError(409, `Invalid status transition from ${shipment.status}.`);
    }

    // Inventory changes happen only for specific transitions.
    if (newStatus === 'CANCELLED' && shouldReleaseOnCancel(shipment.status)) {
      await releaseReservation(client, {
        warehouseId: shipment.origin_warehouse_id,
        sku: shipment.item_sku,
        quantity: shipment.quantity
      });
    }

    if (newStatus === 'PICKED_UP') {
      await consumeReservation(client, {
        warehouseId: shipment.origin_warehouse_id,
        sku: shipment.item_sku,
        quantity: shipment.quantity
      });
    }

    if (newStatus === 'RETURNED') {
      await returnToStock(client, {
        warehouseId: shipment.origin_warehouse_id,
        sku: shipment.item_sku,
        quantity: shipment.quantity
      });
    }

    const updateSql = `
      UPDATE shipments
      SET status = $2, updated_at = NOW(), version = version + 1
      WHERE id = $1
      RETURNING id, status, updated_at, version;
    `;

    const updated = await client.query(updateSql, [id, newStatus]);

    const eventSql = `
      INSERT INTO shipment_events (shipment_id, status, note)
      VALUES ($1, $2, $3);
    `;

    await client.query(eventSql, [
      id,
      newStatus,
      note || `Status changed to ${newStatus}.`
    ]);

    return updated.rows[0];
  });
}

module.exports = {
  createShipment,
  listShipments,
  getShipmentById,
  getShipmentByTracking,
  updateStatus
};
