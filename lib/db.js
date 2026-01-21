// import { Pool } from 'pg';

// // This checks if we are running in "production" or "dev"
// // In dev, we want to reuse the connection so we don't crash the server
// let pool;

// if (!pool) {
//   pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//   });
// }

// export default pool;

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;