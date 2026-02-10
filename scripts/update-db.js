const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function updateDB() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: true,
  });

  try {
    const client = await pool.connect();
    console.log('🔌 Connected to database.');

    const schemaSql = `
      -- Add competitors table
      CREATE TABLE IF NOT EXISTS competitors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT,
        platform TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Add settings column to users if it doesn't exist
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'settings') THEN
              ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
          END IF;
      END $$;
    `;

    console.log('📝 Applying schema updates...');
    await client.query(schemaSql);
    console.log('✅ Schema updates applied successfully!');

    client.release();
  } catch (err) {
    console.error('❌ Error updating database:', err);
  } finally {
    await pool.end();
  }
}

updateDB();
