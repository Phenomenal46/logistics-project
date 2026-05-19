/*
 * shipments.js (routes)
 * Purpose: Define REST endpoints for shipment actions.
 * Why it exists: Routes keep request handling separate from business logic.
 */

const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireBodyFields, toPositiveInt, toOptionalDate, normalizeStatus } = require('../utils/validation');
const { parsePagination } = require('../utils/pagination');
const shipmentsService = require('../services/shipmentsService');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePagination(req.query);
    const status = normalizeStatus(req.query.status);

    const shipments = await shipmentsService.listShipments({ status, limit, offset });
    res.json({ data: shipments, page: Number(req.query.page || 1) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = toPositiveInt(req.params.id, 'id');
    const shipment = await shipmentsService.getShipmentById(id);
    res.json({ data: shipment });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    requireBodyFields(req.body, [
      'originWarehouseId',
      'destinationWarehouseId',
      'itemSku',
      'itemName',
      'quantity'
    ]);

    const payload = {
      originWarehouseId: toPositiveInt(req.body.originWarehouseId, 'originWarehouseId'),
      destinationWarehouseId: toPositiveInt(
        req.body.destinationWarehouseId,
        'destinationWarehouseId'
      ),
      itemSku: String(req.body.itemSku).trim(),
      itemName: String(req.body.itemName).trim(),
      quantity: toPositiveInt(req.body.quantity, 'quantity'),
      requestedDeliveryDate: toOptionalDate(
        req.body.requestedDeliveryDate,
        'requestedDeliveryDate'
      ),
      note: req.body.note ? String(req.body.note) : null
    };

    const shipment = await shipmentsService.createShipment(payload);
    res.status(201).json({ data: shipment });
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    requireBodyFields(req.body, ['newStatus']);

    const payload = {
      id: toPositiveInt(req.params.id, 'id'),
      newStatus: normalizeStatus(req.body.newStatus),
      note: req.body.note ? String(req.body.note) : null,
      expectedCurrentStatus: normalizeStatus(req.body.expectedCurrentStatus)
    };

    const updated = await shipmentsService.updateStatus(payload);
    res.json({ data: updated });
  })
);

module.exports = router;
