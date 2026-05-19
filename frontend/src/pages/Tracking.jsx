/*
 * Tracking.jsx
 * Purpose: Search for a shipment by tracking number.
 * Why it exists: Tracking is the core feature for customers.
 */

import React, { useState } from 'react';
import { apiFetch } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Timeline from '../components/Timeline.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Tracking() {
  // State for the search input and results.
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiFetch(`/tracking/${trackingNumber}`);
      setResult(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tracking</h1>
        <p className="text-sm text-slate-500">
          Enter a tracking number to see the current status and history.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded border bg-white p-4 md:flex-row md:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Tracking Number
          <input
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="TRK-1234ABCD"
            className="rounded border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      <ErrorMessage message={error} />
      {loading ? <Loading label="Searching..." /> : null}

      {result ? (
        <div className="space-y-4 rounded border bg-white p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Tracking Number</p>
              <p className="text-lg font-semibold">
                {result.shipment.tracking_number}
              </p>
              <p className="text-xs text-slate-500">
                {result.shipment.origin_name} → {result.shipment.destination_name}
              </p>
            </div>
            <StatusBadge status={result.shipment.status} />
          </div>

          <div>
            <p className="text-sm font-semibold">Status History</p>
            <Timeline events={result.events} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
