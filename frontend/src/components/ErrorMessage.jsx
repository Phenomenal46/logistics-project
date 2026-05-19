/*
 * ErrorMessage.jsx
 * Purpose: Display an error in a friendly way.
 * Why it exists: Errors should be visible without breaking the UI.
 */

import React from 'react';

export default function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}
