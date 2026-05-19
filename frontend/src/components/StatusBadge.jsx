/*
 * StatusBadge.jsx
 * Purpose: Show shipment status with a simple color label.
 * Why it exists: Status is the most important shipment data for users.
 */

import React from 'react';

const statusStyles = {
  BOOKED: 'bg-slate-200 text-slate-700',
  PACKED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-amber-100 text-amber-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  AT_HUB: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-emerald-100 text-emerald-700',
  DELIVERED: 'bg-green-100 text-green-700',
  DELAYED: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-rose-100 text-rose-700'
};

export default function StatusBadge({ status }) {
  const className = statusStyles[status] || 'bg-slate-100 text-slate-600';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}
