const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function initDb() {
  try {
    console.log('Connecting to database and running schema initialization...');
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sql);
    console.log('✅ Database schema initialized successfully!');
    console.log('Tables "users", "todos" and indexes are ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error.message);
    if (!process.env.DATABASE_URL) {
      console.error('👉 Make sure to create a .env file with your NeonDB DATABASE_URL.');
    }
    process.exit(1);
  }
}

initDb();
