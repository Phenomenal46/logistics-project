/*
 * Dashboard.jsx
 * Purpose: Show a quick list of recent shipments and their priorities.
 * Why it exists: A small dashboard helps users understand system state.
 */

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Pagination from '../components/Pagination.jsx';

export default function Dashboard() {
  // State for shipments list and loading/errors.
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadShipments() {
      setLoading(true);
      setError('');

      try {
        const response = await apiFetch(`/shipments?page=${page}&limit=6`);
        if (isMounted) {
          setShipments(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadShipments();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const hasMore = shipments.length === 6;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Recent shipments with simple delivery prioritization.
        </p>
      </div>

      <ErrorMessage message={error} />

      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent Shipments</h2>
        {loading ? (
          <Loading />
        ) : shipments.length === 0 ? (
          <p className="text-sm text-slate-500">No shipments found.</p>
        ) : (
          <div className="space-y-3">
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex flex-col gap-2 rounded border border-slate-100 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {shipment.tracking_number}
                  </p>
                  <p className="text-xs text-slate-500">
                    {shipment.origin_name} → {shipment.destination_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Item: {shipment.item_name} ({shipment.item_sku})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={shipment.status} />
                  <span className="text-xs text-slate-500">
                    Priority {shipment.priority_rank}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} onPageChange={setPage} hasMore={hasMore} />
      </div>
    </section>
  );
}
