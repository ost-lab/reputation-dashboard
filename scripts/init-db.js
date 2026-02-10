const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function initDB() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  console.log(`🔌 Connecting to database...`);
  
  const pool = new Pool({
    connectionString,
    ssl: true,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully.');

    const schemaPath = path.join(__dirname, '..', 'schema.sql'); // Assumes schema.sql is in root, but I wrote it to artifacts. 
    // Wait, the user can't easily access artifacts from this script if I don't copy it.
    // I should write the schema content directly here or read it from a known location.
    // For now, I'll hardcode the schema content or expect schema.sql in the root.
    // I will WRITE schema.sql to the project root as well for this script to work.
    
    // Actually, I'll just put the SQL in this file to be self-contained for the user.
    const schemaSql = `
      -- Enable UUID extension if not already enabled
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users Table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        provider TEXT DEFAULT 'credentials',
        account_type TEXT DEFAULT 'personal', 
        business_type TEXT,
        platforms TEXT, 
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Verification Codes
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Connected Accounts
      CREATE TABLE IF NOT EXISTS connected_accounts (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at BIGINT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, platform)
      );

      -- Reviews Table
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER,
        content TEXT,
        author_name TEXT,
        source TEXT,
        date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('📝 Applying schema...');
    await client.query(schemaSql);
    console.log('✅ Schema applied successfully!');

    client.release();
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initDB();
