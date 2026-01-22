import { Pool } from 'pg';

// 1. Extend the global namespace so TypeScript doesn't complain
declare global {
  var postgres: Pool | undefined;
}

let conn: Pool;

// 2. Check if we are in production
if (process.env.NODE_ENV === 'production') {
  conn = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true, // Use 'true' or { rejectUnauthorized: false } for Neon
  });
} else {
  // 3. In development, save the connection to the global object
  // so it survives hot-reloads and doesn't crash your database
  if (!global.postgres) {
    global.postgres = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
  }
  conn = global.postgres;
}

export default conn;