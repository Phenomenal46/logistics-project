/*
 * CreateShipment.jsx
 * Purpose: Provide a form to book a new shipment and reserve stock.
 * Why it exists: Creating shipments demonstrates the core logistics flow.
 */

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function CreateShipment() {
  // Form state that powers the shipment creation form.
  const [form, setForm] = useState({
    originWarehouseId: '',
    destinationWarehouseId: '',
    itemSku: '',
    itemName: '',
    quantity: 1,
    requestedDeliveryDate: ''
  });

  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      if (!form.originWarehouseId) {
        setInventory([]);
        return;
      }

      try {
        const response = await apiFetch(
          `/inventory?warehouseId=${form.originWarehouseId}&page=1&limit=20`
        );
        if (isMounted) {
          setInventory(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      }
    }

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, [form.originWarehouseId]);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiFetch('/shipments', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity)
        })
      });

      setSuccessMessage(
        `Shipment created. Tracking number: ${response.data.tracking_number}`
      );
      setForm((prev) => ({
        ...prev,
        itemSku: '',
        itemName: '',
        quantity: 1,
        requestedDeliveryDate: ''
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Shipment</h1>
        <p className="text-sm text-slate-500">
          Book a shipment and reserve stock in one step.
        </p>
      </div>

      <ErrorMessage message={error} />
      {successMessage ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded border bg-white p-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Origin Warehouse
            <select
              name="originWarehouseId"
              value={form.originWarehouseId}
              onChange={handleChange}
              className="rounded border px-3 py-2"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.city})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Destination Warehouse
            <select
              name="destinationWarehouseId"
              value={form.destinationWarehouseId}
              onChange={handleChange}
              className="rounded border px-3 py-2"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.city})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Item SKU
            <input
              name="itemSku"
              value={form.itemSku}
              onChange={handleChange}
              placeholder="SKU-BOX-S"
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Item Name
            <input
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Small Box"
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Quantity
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              className="rounded border px-3 py-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Requested Delivery Date (optional)
          <input
            name="requestedDeliveryDate"
            type="date"
            value={form.requestedDeliveryDate}
            onChange={handleChange}
            className="rounded border px-3 py-2"
          />
        </label>

        {loading ? <Loading label="Creating shipment..." /> : null}

        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Create Shipment
        </button>
      </form>

      <div className="rounded border bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-700">Available inventory</p>
        {inventory.length === 0 ? (
          <p className="text-xs text-slate-500">
            Select an origin warehouse to see inventory.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {inventory.map((item) => (
              <li key={item.id}>
                {item.item_name} ({item.sku}) - Available: {item.available_qty}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
