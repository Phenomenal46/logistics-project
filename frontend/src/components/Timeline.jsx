/*
 * Timeline.jsx
 * Purpose: Render shipment status history in a vertical timeline.
 * Why it exists: Seeing the full history is key to tracking logic.
 */

import React from 'react';
import StatusBadge from './StatusBadge.jsx';

export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-slate-500">No events yet.</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={`${event.status}-${index}`} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="text-xs text-slate-500">
                {new Date(event.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-700">{event.note || 'No note.'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
