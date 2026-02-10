const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id';
    `);
    console.log('User ID Type:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkSchema();
