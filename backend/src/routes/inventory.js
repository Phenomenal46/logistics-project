/*
 * inventory.js (routes)
 * Purpose: Provide endpoints to read and adjust inventory.
 * Why it exists: Keeps inventory logic accessible from the frontend.
 */

const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireBodyFields, toPositiveInt } = require('../utils/validation');
const { parsePagination } = require('../utils/pagination');
const inventoryService = require('../services/inventoryService');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePagination(req.query);
    const warehouseId = req.query.warehouseId
      ? toPositiveInt(req.query.warehouseId, 'warehouseId')
      : null;

    const inventory = await inventoryService.listInventory({ warehouseId, limit, offset });
    res.json({ data: inventory, page: Number(req.query.page || 1) });
  })
);

router.post(
  '/adjust',
  asyncHandler(async (req, res) => {
    requireBodyFields(req.body, ['warehouseId', 'sku', 'itemName', 'delta']);

    const payload = {
      warehouseId: toPositiveInt(req.body.warehouseId, 'warehouseId'),
      sku: String(req.body.sku).trim(),
      itemName: String(req.body.itemName).trim(),
      delta: toPositiveInt(req.body.delta, 'delta')
    };

    const updated = await inventoryService.adjustStock(payload);
    res.json({ data: updated });
  })
);

module.exports = router;
