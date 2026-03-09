const db = require('./config/db');

async function fixSchema() {
  try {
    console.log("Dropping existing corrupted sales table and fully recreating it...");
    
    // We will drop the sales table and recreate it perfectly based on init_database.sql
    // ONLY DO THIS IF WE CAN CONFIRM THERE'S NO REAL DATA YET
    await db.query(`DROP TABLE IF EXISTS sales CASCADE;`);
    
    await db.query(`
      CREATE TABLE sales (
        sale_id SERIAL PRIMARY KEY,
        branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
        receipt_no VARCHAR(100) UNIQUE,
        product_name VARCHAR(255),
        customer_name VARCHAR(255),
        contact VARCHAR(20),
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        sale_date DATE NOT NULL,
        created_by INTEGER REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await db.query(`CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);`);

    console.log("Successfully recreated sales table schema.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

fixSchema();
