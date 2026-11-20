const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL environment variable is not defined in .env.');
}

const isProduction = process.env.NODE_ENV === 'production';
const requiresSSL = connectionString && (
  connectionString.includes('neon.tech') || 
  connectionString.includes('sslmode=require') || 
  isProduction
);

const pool = new Pool({
  connectionString,
  ssl: requiresSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
