/*
 * pagination.js
 * Purpose: Convert page + limit query params into SQL limit/offset values.
 * Why it exists: Pagination keeps responses small and fast for large lists.
 * Tradeoff: Paginated lists can miss updates between pages.
 */

function parsePagination(query) {
  const pageRaw = Number(query.page);
  const limitRaw = Number(query.limit);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;
  const safeLimit = Math.min(limit, 50);
  const offset = (page - 1) * safeLimit;
  return { page, limit: safeLimit, offset };
}

module.exports = { parsePagination };
