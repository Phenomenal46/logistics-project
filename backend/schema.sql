-- schema.sql
-- This file defines the tables and indexes for the logistics system.
-- It exists so the database structure is created consistently every time.

-- Warehouses hold inventory and act as shipment origin/destination points.
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inventory rows represent stock for a specific SKU inside a warehouse.
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
  sku TEXT NOT NULL,
  item_name TEXT NOT NULL,
  total_qty INTEGER NOT NULL,
  reserved_qty INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_unique_sku UNIQUE (warehouse_id, sku),
  -- These checks prevent negative stock at the database level as a safety net.
  CONSTRAINT inventory_total_non_negative CHECK (total_qty >= 0),
  CONSTRAINT inventory_reserved_non_negative CHECK (reserved_qty >= 0),
  CONSTRAINT inventory_reserved_not_over_total CHECK (reserved_qty <= total_qty)
);

-- Shipments represent a customer delivery request and its current status.
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  origin_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
  destination_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
  item_sku TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL,
  requested_delivery_date DATE NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT shipments_quantity_positive CHECK (quantity > 0),
  -- Keep statuses in a known list so invalid text cannot enter the system.
  CONSTRAINT shipments_status_check CHECK (
    status IN (
      'BOOKED',
      'PACKED',
      'PICKED_UP',
      'IN_TRANSIT',
      'AT_HUB',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'DELAYED',
      'CANCELLED',
      'RETURNED'
    )
  )
);

-- Shipment events store the full history of status changes.
CREATE TABLE IF NOT EXISTS shipment_events (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT shipment_events_status_check CHECK (
    status IN (
      'BOOKED',
      'PACKED',
      'PICKED_UP',
      'IN_TRANSIT',
      'AT_HUB',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'DELAYED',
      'CANCELLED',
      'RETURNED'
    )
  )
);

-- Indexes speed up lookups but add a small cost to every write.
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_origin ON shipments(origin_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_shipments_destination ON shipments(destination_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_events_shipment_created ON shipment_events(shipment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_sku ON inventory(warehouse_id, sku);
