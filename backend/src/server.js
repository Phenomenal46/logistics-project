/*
 * server.js
 * Purpose: Start the Express API server and wire middleware + routes.
 * Why it exists: This is the single entry point that boots the backend.
 * Node.js note: Node can handle many requests because it uses an event loop
 * and non-blocking I/O, so one slow request does not block the whole server.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const shipmentsRoutes = require('./routes/shipments');
const inventoryRoutes = require('./routes/inventory');
const trackingRoutes = require('./routes/tracking');
const warehousesRoutes = require('./routes/warehouses');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Allow the frontend dev server to call this API during development.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

// Parse JSON request bodies.
app.use(express.json());

// Lightweight health check for quick sanity tests.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/shipments', shipmentsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/warehouses', warehousesRoutes);

// 404 handler for unknown routes.
app.use(notFoundHandler);

// Central error handler keeps responses consistent and beginner friendly.
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Logistics API listening on port ${port}`);
});
