/*
 * errorHandler.js
 * Purpose: Centralize error formatting for all API routes.
 * Why it exists: Consistent errors help beginners debug faster.
 * Tradeoff: In production you would avoid returning internal details.
 */

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'NotFound', message: 'Route not found.' });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Unexpected server error.';

  res.status(status).json({
    error: status >= 500 ? 'ServerError' : 'BadRequest',
    message
  });
}

module.exports = { errorHandler, notFoundHandler };
