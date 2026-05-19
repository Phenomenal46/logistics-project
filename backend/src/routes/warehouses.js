/*
 * warehouses.js (routes)
 * Purpose: Provide a simple list of warehouses.
 * Why it exists: The UI needs warehouse options for shipment creation.
 */

const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { pool } = require('../db/pool');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT id, name, code, city
      FROM warehouses
      ORDER BY name ASC;
    `;

    const result = await pool.query(sql);
    res.json({ data: result.rows });
  })
);

module.exports = router;
