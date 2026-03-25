const db = require("../config/db");

async function fixSchema() {
  try {
    console.log("Rebuilding corrupted tables one by one...");
    
    // 1. EMPLOYEES
    await db.query(`DROP TABLE IF EXISTS employees CASCADE;`);
    await db.query(`
      CREATE TABLE employees (
        employee_id SERIAL PRIMARY KEY,
        branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        age INTEGER,
        designation VARCHAR(100),
        address TEXT,
        mobile_no VARCHAR(20),
        experience INTEGER,
        salary DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);`);

    // 2. EXPENSES
    await db.query(`DROP TABLE IF EXISTS expenses CASCADE;`);
    await db.query(`
      CREATE TABLE expenses (
        expense_id SERIAL PRIMARY KEY,
        branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
        expense_type VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        expense_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_expenses_branch_id ON expenses(branch_id);`);

    // 3. INVENTORY
    await db.query(`DROP TABLE IF EXISTS inventory CASCADE;`);
    await db.query(`
      CREATE TABLE inventory (
        inventory_id SERIAL PRIMARY KEY,
        branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
        product_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50),
        reorder_level DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_inventory_branch_id ON inventory(branch_id);`);

    // 4. NOTIFICATIONS
    await db.query(`DROP TABLE IF EXISTS notifications CASCADE;`);
    await db.query(`
      CREATE TABLE notifications (
        notification_id SERIAL PRIMARY KEY,
        branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
        role_id INTEGER REFERENCES roles(role_id),
        message TEXT NOT NULL,
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_notifications_branch_id ON notifications(branch_id);`);

    console.log("Successfully rebuilt expenses, employees, inventory, and notifications tables.");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}
fixSchema();
