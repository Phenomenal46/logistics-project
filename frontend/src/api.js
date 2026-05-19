/*
 * api.js
 * Purpose: Small wrapper around fetch for the frontend.
 * Why it exists: Centralizing API calls keeps error handling consistent.
 * Tradeoff: This is simple and does not include caching or retries.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    body = {};
  }

  if (!response.ok) {
    const message = body.message || 'Request failed.';
    throw new Error(message);
  }

  return body;
}
