/*
 * tracking.js (routes)
 * Purpose: Provide an endpoint to search by tracking number.
 * Why it exists: Tracking is a core logistics feature for users.
 */

const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const shipmentsService = require('../services/shipmentsService');

const router = express.Router();

router.get(
  '/:trackingNumber',
  asyncHandler(async (req, res) => {
    const trackingNumber = String(req.params.trackingNumber).trim();
    const result = await shipmentsService.getShipmentByTracking(trackingNumber);
    res.json({ data: result });
  })
);

module.exports = router;
