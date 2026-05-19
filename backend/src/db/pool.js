/*
 * pool.js
 * Purpose: Create one reusable PostgreSQL connection pool.
 * Why it exists: A pool reuses connections so the API does not open a new
 * connection for every request, which is slower and can exhaust the DB.
 * Tradeoff: Larger pools can handle more concurrency but use more DB memory.
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: Number(process.env.PGPOOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS || 2000)
});

module.exports = { pool };
