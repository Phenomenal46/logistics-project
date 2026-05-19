/*
 * transaction.js
 * Purpose: Provide a safe helper for running PostgreSQL transactions.
 * Why it exists: Many logistics actions must be atomic (all-or-nothing),
 * such as reserving inventory and creating a shipment together.
 * Tradeoff: Transactions add overhead, but they prevent data corruption.
 */

const { pool } = require('./pool');

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { withTransaction };
