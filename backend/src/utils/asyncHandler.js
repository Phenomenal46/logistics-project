/*
 * asyncHandler.js
 * Purpose: Wrap async route handlers and forward errors to Express.
 * Why it exists: It avoids repeating try/catch in every route.
 */

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
