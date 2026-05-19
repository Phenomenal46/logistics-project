/*
 * errors.js
 * Purpose: Create consistent API errors with HTTP status codes.
 * Why it exists: It keeps error handling simple and beginner friendly.
 */

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = { createError };
