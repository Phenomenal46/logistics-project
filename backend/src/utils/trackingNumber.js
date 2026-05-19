/*
 * trackingNumber.js
 * Purpose: Generate readable unique tracking numbers for shipments.
 * Why it exists: Tracking numbers are how users find shipments in the UI.
 * Tradeoff: Random IDs are simple; real systems may use structured formats.
 */

const crypto = require('crypto');

function generateTrackingNumber() {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TRK-${randomPart}`;
}

module.exports = { generateTrackingNumber };
