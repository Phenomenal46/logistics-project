/*
 * Inventory.jsx
 * Purpose: Display warehouse inventory and allow simple restocking.
 * Why it exists: Inventory visibility is crucial in logistics systems.
 */

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Pagination from '../components/Pagination.jsx';

export default function Inventory() {
  // State for inventory data, warehouse selection, and restock form.
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [page, setPage] = useState(1);
  // This token lets us refresh the list after a restock without changing filters.
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    warehouseId: '',
    sku: '',
    itemName: '',
    delta: 1
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadWarehouses() {
      try {
        const response = await apiFetch('/warehouses');
        if (isMounted) {
          setWarehouses(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      }
    }

    loadWarehouses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInventory() {
      setLoading(true);
      setError('');

      try {
        const filter = warehouseId ? `warehouseId=${warehouseId}&` : '';
        const response = await apiFetch(`/inventory?${filter}page=${page}&limit=8`);
        if (isMounted) {
          setInventory(response.data || []);
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

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, [warehouseId, page, reloadToken]);

  function handleFormChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleRestock(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          warehouseId: Number(form.warehouseId),
          delta: Number(form.delta)
        })
      });

      setSuccessMessage('Inventory updated.');
      setForm((prev) => ({ ...prev, sku: '', itemName: '', delta: 1 }));
      setPage(1);
      setReloadToken((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const hasMore = inventory.length === 8;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-slate-500">
          View available stock and add new stock when needed.
        </p>
      </div>

      <ErrorMessage message={error} />
      {successMessage ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Inventory List</h2>
          <select
            value={warehouseId}
            onChange={(event) => {
              setWarehouseId(event.target.value);
              setPage(1);
            }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loading />
        ) : inventory.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No inventory found.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded border border-slate-100 bg-slate-50 p-3 text-sm"
              >
                <p className="font-semibold">
                  {item.item_name} ({item.sku})
                </p>
                <p className="text-xs text-slate-500">
                  Warehouse: {item.warehouse_name}
                </p>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span>Total: {item.total_qty}</span>
                  <span>Reserved: {item.reserved_qty}</span>
                  <span>Available: {item.available_qty}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} onPageChange={setPage} hasMore={hasMore} />
      </div>

      <form
        onSubmit={handleRestock}
        className="space-y-4 rounded border bg-white p-4"
      >
        <h2 className="text-lg font-semibold">Restock Inventory</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Warehouse
            <select
              name="warehouseId"
              value={form.warehouseId}
              onChange={handleFormChange}
              className="rounded border px-3 py-2"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            SKU
            <input
              name="sku"
              value={form.sku}
              onChange={handleFormChange}
              placeholder="SKU-BOX-S"
              className="rounded border px-3 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Item Name
            <input
              name="itemName"
              value={form.itemName}
              onChange={handleFormChange}
              placeholder="Small Box"
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Add Quantity
            <input
              name="delta"
              type="number"
              min="1"
              value={form.delta}
              onChange={handleFormChange}
              className="rounded border px-3 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add Stock
        </button>
      </form>
    </section>
  );
}
