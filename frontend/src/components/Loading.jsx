/*
 * Loading.jsx
 * Purpose: Show a simple loading message.
 * Why it exists: Users need feedback while data is being fetched.
 */

import React from 'react';

export default function Loading({ label = 'Loading...' }) {
  return <p className="text-sm text-slate-500">{label}</p>;
}
