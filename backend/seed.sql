-- seed.sql
-- This file inserts small sample data so the UI has something to show.
-- It exists to make first-time setup easy for beginners.

BEGIN;

-- Warehouses used in the demo.
INSERT INTO warehouses (name, code, city)
VALUES
  ('North Hub Warehouse', 'WH-NYC', 'New York'),
  ('Midwest Hub Warehouse', 'WH-CHI', 'Chicago')
ON CONFLICT (code) DO NOTHING;

-- Inventory items. Reserved quantities reflect a booked shipment below.
INSERT INTO inventory (warehouse_id, sku, item_name, total_qty, reserved_qty)
SELECT id, 'SKU-BOX-S', 'Small Box', 100, 10
FROM warehouses
WHERE code = 'WH-NYC'
ON CONFLICT (warehouse_id, sku)
DO UPDATE SET
  item_name = EXCLUDED.item_name,
  total_qty = EXCLUDED.total_qty,
  reserved_qty = EXCLUDED.reserved_qty,
  updated_at = NOW();

INSERT INTO inventory (warehouse_id, sku, item_name, total_qty, reserved_qty)
SELECT id, 'SKU-BOX-M', 'Medium Box', 40, 0
FROM warehouses
WHERE code = 'WH-NYC'
ON CONFLICT (warehouse_id, sku)
DO UPDATE SET
  item_name = EXCLUDED.item_name,
  total_qty = EXCLUDED.total_qty,
  reserved_qty = EXCLUDED.reserved_qty,
  updated_at = NOW();

INSERT INTO inventory (warehouse_id, sku, item_name, total_qty, reserved_qty)
SELECT id, 'SKU-LABEL', 'Shipping Label', 200, 0
FROM warehouses
WHERE code = 'WH-CHI'
ON CONFLICT (warehouse_id, sku)
DO UPDATE SET
  item_name = EXCLUDED.item_name,
  total_qty = EXCLUDED.total_qty,
  reserved_qty = EXCLUDED.reserved_qty,
  updated_at = NOW();

-- Sample shipments.
INSERT INTO shipments (
  tracking_number,
  origin_warehouse_id,
  destination_warehouse_id,
  item_sku,
  item_name,
  quantity,
  status,
  requested_delivery_date
)
VALUES
  (
    'TRK-BOOKED-001',
    (SELECT id FROM warehouses WHERE code = 'WH-NYC'),
    (SELECT id FROM warehouses WHERE code = 'WH-CHI'),
    'SKU-BOX-S',
    'Small Box',
    10,
    'BOOKED',
    NULL
  ),
  -- This shipment already left the warehouse, so total stock is lower in inventory.
  (
    'TRK-INTRANSIT-001',
    (SELECT id FROM warehouses WHERE code = 'WH-NYC'),
    (SELECT id FROM warehouses WHERE code = 'WH-CHI'),
    'SKU-BOX-M',
    'Medium Box',
    5,
    'IN_TRANSIT',
    NULL
  )
ON CONFLICT (tracking_number) DO NOTHING;

-- Events for shipment history.
INSERT INTO shipment_events (shipment_id, status, note)
SELECT id, 'BOOKED', 'Shipment booked and stock reserved.'
FROM shipments
WHERE tracking_number = 'TRK-BOOKED-001';

INSERT INTO shipment_events (shipment_id, status, note)
SELECT id, 'BOOKED', 'Shipment booked and stock reserved.'
FROM shipments
WHERE tracking_number = 'TRK-INTRANSIT-001';

INSERT INTO shipment_events (shipment_id, status, note)
SELECT id, 'PACKED', 'Items packed at origin warehouse.'
FROM shipments
WHERE tracking_number = 'TRK-INTRANSIT-001';

INSERT INTO shipment_events (shipment_id, status, note)
SELECT id, 'PICKED_UP', 'Carrier picked up the items.'
FROM shipments
WHERE tracking_number = 'TRK-INTRANSIT-001';

INSERT INTO shipment_events (shipment_id, status, note)
SELECT id, 'IN_TRANSIT', 'Shipment moving between hubs.'
FROM shipments
WHERE tracking_number = 'TRK-INTRANSIT-001';

COMMIT;
