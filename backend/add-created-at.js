const pool = require('./config/db');

async function addCreatedAtColumn() {
  try {
    console.log('Adding created_at column to branches table...');
    await pool.query(`
      ALTER TABLE branches 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ Successfully added created_at column');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

addCreatedAtColumn();
