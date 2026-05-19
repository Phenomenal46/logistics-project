/*
 * validation.js
 * Purpose: Small helpers to validate and normalize incoming data.
 * Why it exists: Simple validation keeps the API predictable and safe.
 * Tradeoff: This is not as powerful as full schema validation libraries,
 * but it is easier for beginners to read.
 */

const { createError } = require('./errors');

function requireBodyFields(body, fields) {
  fields.forEach((field) => {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw createError(400, `Missing required field: ${field}`);
    }
  });
}

function toPositiveInt(value, fieldName) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw createError(400, `${fieldName} must be a positive integer`);
  }
  return numberValue;
}

function toOptionalDate(value, fieldName) {
  if (!value) {
    return null;
  }
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    throw createError(400, `${fieldName} must be a valid date`);
  }
  return dateValue.toISOString().slice(0, 10);
}

function normalizeStatus(value) {
  if (!value) {
    return null;
  }
  return String(value).trim().toUpperCase();
}

module.exports = {
  requireBodyFields,
  toPositiveInt,
  toOptionalDate,
  normalizeStatus
};
