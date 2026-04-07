const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment.');
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

module.exports = { db, pool };
