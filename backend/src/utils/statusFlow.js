/*
 * statusFlow.js
 * Purpose: Define valid shipment statuses and transitions.
 * Why it exists: Logistics flows must be consistent; this blocks invalid jumps
 * like DELIVERED -> PACKED which would break real-world logic.
 * Tradeoff: A strict flow is safer but less flexible for unusual cases.
 */

const STATUSES = {
  BOOKED: 'BOOKED',
  PACKED: 'PACKED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_HUB: 'AT_HUB',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  DELAYED: 'DELAYED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
};

const TERMINAL_STATUSES = new Set([
  STATUSES.DELIVERED,
  STATUSES.CANCELLED,
  STATUSES.RETURNED
]);

const ALLOWED_TRANSITIONS = {
  [STATUSES.BOOKED]: [STATUSES.PACKED, STATUSES.CANCELLED],
  [STATUSES.PACKED]: [STATUSES.PICKED_UP, STATUSES.DELAYED, STATUSES.CANCELLED],
  [STATUSES.PICKED_UP]: [STATUSES.IN_TRANSIT, STATUSES.DELAYED],
  [STATUSES.IN_TRANSIT]: [STATUSES.AT_HUB, STATUSES.DELAYED],
  [STATUSES.AT_HUB]: [STATUSES.OUT_FOR_DELIVERY, STATUSES.DELAYED],
  [STATUSES.OUT_FOR_DELIVERY]: [
    STATUSES.DELIVERED,
    STATUSES.DELAYED,
    STATUSES.RETURNED
  ],
  [STATUSES.DELAYED]: [
    STATUSES.PACKED,
    STATUSES.IN_TRANSIT,
    STATUSES.AT_HUB,
    STATUSES.OUT_FOR_DELIVERY
  ]
};

function isValidTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}

module.exports = {
  STATUSES,
  ALLOWED_TRANSITIONS,
  TERMINAL_STATUSES,
  isValidTransition,
  isTerminalStatus
};
