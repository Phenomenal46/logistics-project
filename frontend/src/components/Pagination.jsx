/*
 * Pagination.jsx
 * Purpose: Simple Previous/Next controls for paginated lists.
 * Why it exists: Pagination keeps data small and easy to load.
 */

import React from 'react';

export default function Pagination({ page, onPageChange, hasMore }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        type="button"
        className="rounded border px-3 py-1 text-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-slate-600">Page {page}</span>
      <button
        type="button"
        className="rounded border px-3 py-1 text-sm"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
