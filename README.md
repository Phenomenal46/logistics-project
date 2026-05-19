# Logistics Management Project (React + Node + Express + PostgreSQL)

## What this project does
This is a beginner-friendly logistics management system that shows real-world logic in a clean, interview-ready way. It covers shipment lifecycles, inventory reservation, tracking, and safe concurrency using PostgreSQL transactions.

## Architecture overview
- **Backend**: Node.js + Express REST API with a single PostgreSQL connection pool.
- **Database**: PostgreSQL with tables for warehouses, inventory, shipments, and shipment history.
- **Frontend**: React + Tailwind CSS for clean and simple screens.

## Folder structure
- backend: Express server, SQL schema, seed data.
- frontend: React app with pages and reusable components.

## Setup steps
### 1) Database setup
1. Create a PostgreSQL database (example name: logistics_db).
2. Run the SQL schema file to create tables.
3. Run the seed file to insert sample data.

Example flow in plain words:
- First run schema.sql to create tables and indexes.
- Then run seed.sql to insert demo warehouses, inventory, and shipments.

### 2) Backend setup
1. Copy backend/.env.example to backend/.env.
2. Fill in your PostgreSQL credentials.
3. Install dependencies and start the server:
   - npm install
   - npm run dev

The backend runs on port 4000 by default.

### 3) Frontend setup
1. Copy frontend/.env.example to frontend/.env.
2. Set VITE_API_BASE_URL to your backend API URL.
3. Install dependencies and start the frontend:
   - npm install
   - npm run dev

The frontend runs on port 5173 by default.

## Key API endpoints
- GET /api/health
- GET /api/warehouses
- GET /api/inventory?page=1&limit=10&warehouseId=1
- POST /api/inventory/adjust
- GET /api/shipments?page=1&limit=10&status=IN_TRANSIT
- GET /api/shipments/:id
- POST /api/shipments
- PATCH /api/shipments/:id/status (body: newStatus, note?, expectedCurrentStatus?)
- GET /api/tracking/:trackingNumber

## Database tables and relationships
- warehouses: list of warehouses and hubs.
- inventory: stock per warehouse and SKU. Linked to warehouses.
- shipments: shipment records with current status and item info.
- shipment_events: full history of status changes for each shipment.

Relationships:
- inventory.warehouse_id -> warehouses.id
- shipments.origin_warehouse_id -> warehouses.id
- shipments.destination_warehouse_id -> warehouses.id
- shipment_events.shipment_id -> shipments.id

## Logistics rules implemented
- Shipments follow a valid status flow (no invalid jumps).
- Every status change inserts a shipment_events record.
- Inventory is reserved when a shipment is created.
- Inventory is consumed when the shipment is picked up.
- Inventory is released if the shipment is cancelled before pickup.
- Inventory is returned if the shipment is returned.

## Concurrency and correctness 
- **Node.js concurrency**: Node uses an event loop and non-blocking I/O, so it can serve many API requests without one slow request blocking all others.
- **Transactions**: Shipment creation and inventory reservation happen inside a single transaction so they succeed or fail together.
- **Row locking**: Inventory rows are locked with SELECT ... FOR UPDATE so two requests cannot reserve the same stock at the same time.
- **Status conflicts**: Status updates check the current status and block invalid transitions. The optional expectedCurrentStatus adds a simple optimistic check.
- **Indexes**: Tracking number, status, and foreign key columns are indexed for fast searches.


## Edge cases handled
- Insufficient inventory returns a clear error.
- Duplicate tracking number is retried during creation.
- Cancelled shipments release inventory only if pickup did not happen.
- Delivered shipments cannot be moved backward.
- Invalid status transitions return a clear error.

## Limitations and tradeoffs
- No caching layer (Redis). This keeps it simple but slower under heavy load.
- Simple delivery priority logic; real systems use time windows and route optimization.
- No user authentication or role-based permissions.
- Pagination can miss updates between pages, but it keeps responses small.
- Indexes speed up reads but add small overhead to every write.

## What could be added later
- Authentication and user roles.
- Real-time updates via websockets.
- Route optimization and estimated delivery time logic.
- Caching for tracking lookups.
- Background jobs for status automation.

