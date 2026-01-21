import { Pool } from 'pg';

let conn: any;

if (!conn) {
  conn = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true, // Required for Neon
  });
}

export default conn;