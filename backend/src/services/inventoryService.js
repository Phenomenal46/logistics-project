/*
 * inventoryService.js
 * Purpose: Handle inventory reads and safe stock updates.
 * Why it exists: Inventory rules are tricky, so we centralize them here.
 * Concurrency note: We use row locks (SELECT ... FOR UPDATE) when reserving
 * or consuming stock so two requests cannot double-reserve the same items.
 */

const { pool } = require('../db/pool');
const { withTransaction } = require('../db/transaction');
const { createError } = require('../utils/errors');

async function listInventory({ warehouseId, limit, offset }) {
  // Query only the columns we need to keep responses small.
  const sql = `
    SELECT
      i.id,
      i.warehouse_id,
      w.name AS warehouse_name,
      i.sku,
      i.item_name,
      i.total_qty,
      i.reserved_qty,
      (i.total_qty - i.reserved_qty) AS available_qty,
      i.updated_at
    FROM inventory i
    JOIN warehouses w ON w.id = i.warehouse_id
    WHERE ($1::int IS NULL OR i.warehouse_id = $1)
    ORDER BY i.item_name ASC
    LIMIT $2 OFFSET $3;
  `;

  const result = await pool.query(sql, [warehouseId, limit, offset]);
  return result.rows;
}

async function adjustStock({ warehouseId, sku, itemName, delta }) {
  if (delta <= 0) {
    throw createError(400, 'Stock adjustment must be a positive number.');
  }

  return withTransaction(async (client) => {
    // This UPSERT keeps the operation atomic and safe under concurrency.
    const sql = `
      INSERT INTO inventory (warehouse_id, sku, item_name, total_qty, reserved_qty)
      VALUES ($1, $2, $3, $4, 0)
      ON CONFLICT (warehouse_id, sku)
      DO UPDATE SET
        item_name = EXCLUDED.item_name,
        total_qty = inventory.total_qty + EXCLUDED.total_qty,
        updated_at = NOW()
      RETURNING
        id,
        warehouse_id,
        sku,
        item_name,
        total_qty,
        reserved_qty,
        (total_qty - reserved_qty) AS available_qty,
        updated_at;
    `;

    const result = await client.query(sql, [warehouseId, sku, itemName, delta]);
    return result.rows[0];
  });
}

async function getInventoryRowForUpdate(client, { warehouseId, sku }) {
  // Row lock prevents other transactions from changing this inventory row.
  const sql = `
    SELECT id, total_qty, reserved_qty
    FROM inventory
    WHERE warehouse_id = $1 AND sku = $2
    FOR UPDATE;
  `;

  const result = await client.query(sql, [warehouseId, sku]);
  if (result.rowCount === 0) {
    throw createError(404, 'Inventory item not found for this warehouse.');
  }
  return result.rows[0];
}

async function reserveStock(client, { warehouseId, sku, quantity }) {
  const row = await getInventoryRowForUpdate(client, { warehouseId, sku });
  const available = row.total_qty - row.reserved_qty;

  if (available < quantity) {
    throw createError(409, 'Not enough available stock to reserve.');
  }

  const sql = `
    UPDATE inventory
    SET reserved_qty = reserved_qty + $1, updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      warehouse_id,
      sku,
      item_name,
      total_qty,
      reserved_qty,
      (total_qty - reserved_qty) AS available_qty,
      updated_at;
  `;

  const result = await client.query(sql, [quantity, row.id]);
  return result.rows[0];
}

async function releaseReservation(client, { warehouseId, sku, quantity }) {
  const row = await getInventoryRowForUpdate(client, { warehouseId, sku });

  if (row.reserved_qty < quantity) {
    throw createError(409, 'Cannot release more stock than is reserved.');
  }

  const sql = `
    UPDATE inventory
    SET reserved_qty = reserved_qty - $1, updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      warehouse_id,
      sku,
      item_name,
      total_qty,
      reserved_qty,
      (total_qty - reserved_qty) AS available_qty,
      updated_at;
  `;

  const result = await client.query(sql, [quantity, row.id]);
  return result.rows[0];
}

async function consumeReservation(client, { warehouseId, sku, quantity }) {
  const row = await getInventoryRowForUpdate(client, { warehouseId, sku });

  if (row.reserved_qty < quantity) {
    throw createError(409, 'Reserved stock is not enough to consume.');
  }

  if (row.total_qty < quantity) {
    throw createError(409, 'Total stock is not enough to consume.');
  }

  const sql = `
    UPDATE inventory
    SET
      total_qty = total_qty - $1,
      reserved_qty = reserved_qty - $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      warehouse_id,
      sku,
      item_name,
      total_qty,
      reserved_qty,
      (total_qty - reserved_qty) AS available_qty,
      updated_at;
  `;

  const result = await client.query(sql, [quantity, row.id]);
  return result.rows[0];
}

async function returnToStock(client, { warehouseId, sku, quantity }) {
  const row = await getInventoryRowForUpdate(client, { warehouseId, sku });

  const sql = `
    UPDATE inventory
    SET total_qty = total_qty + $1, updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      warehouse_id,
      sku,
      item_name,
      total_qty,
      reserved_qty,
      (total_qty - reserved_qty) AS available_qty,
      updated_at;
  `;

  const result = await client.query(sql, [quantity, row.id]);
  return result.rows[0];
}

module.exports = {
  listInventory,
  adjustStock,
  reserveStock,
  releaseReservation,
  consumeReservation,
  returnToStock
};
