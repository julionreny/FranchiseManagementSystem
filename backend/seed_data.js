const db = require("./config/db");
const bcrypt = require("bcrypt");

async function seedData() {
  try {
    console.log("--- Starting Full Database Seeding ---");

    // 1. Clean existing data (Careful with order due to FK)
    console.log("Cleaning old data...");
    await db.query("DELETE FROM notifications");
    await db.query("DELETE FROM inventory");
    await db.query("DELETE FROM expenses");
    await db.query("DELETE FROM sales");
    await db.query("DELETE FROM employees");
    
    // Break the manager_id -> user_id circular dependency
    await db.query("UPDATE branches SET manager_id = NULL");
    // Break the branch_id -> branch_id dependency in users
    await db.query("UPDATE users SET branch_id = NULL");
    
    await db.query("DELETE FROM branches");
    await db.query("DELETE FROM franchises");
    await db.query("DELETE FROM users WHERE email != 'admin@system.com'");

    // 2. Create Owner
    const hashedPass = await bcrypt.hash("password123", 10);
    const ownerRes = await db.query(
      `INSERT INTO users (name, email, password, role_id, status) 
       VALUES ($1, $2, $3, 1, 'ACTIVE') RETURNING user_id`,
      ["Test Owner", "owner@test.com", hashedPass]
    );
    const ownerId = ownerRes.rows[0].user_id;

    // 3. Create Franchise
    const franchiseRes = await db.query(
      `INSERT INTO franchises (franchise_name, owner_id, location, contact_email, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING franchise_id`,
      ["Bite & Buzz", ownerId, "Headquarters, Bengaluru", "contact@bitebuzz.com", "A premium fast-food franchise."]
    );
    const franchiseId = franchiseRes.rows[0].franchise_id;

    const branches = [
      { name: "Bengaluru Central", loc: "MG Road" },
      { name: "Chennai Hub", loc: "T. Nagar" },
      { name: "Calicut Corner", loc: "Beach Road" },
      { name: "Kochi Kitchen", loc: "Marine Drive" }
    ];

    for (const bData of branches) {
      // 4. Create Branch
      const branchRes = await db.query(
        `INSERT INTO branches (franchise_id, branch_name, location, status)
         VALUES ($1, $2, $3, 'ACTIVE') RETURNING branch_id`,
        [franchiseId, bData.name, bData.loc]
      );
      const branchId = branchRes.rows[0].branch_id;

      // 5. Create Manager for Branch
      const managerEmail = `manager.${bData.name.split(' ')[0].toLowerCase()}@test.com`;
      const managerRes = await db.query(
        `INSERT INTO users (name, email, password, role_id, branch_id, status)
         VALUES ($1, $2, $3, 2, $4, 'ACTIVE') RETURNING user_id`,
        [`Manager ${bData.name.split(' ')[0]}`, managerEmail, hashedPass, branchId]
      );
      const managerId = managerRes.rows[0].user_id;

      await db.query("UPDATE branches SET manager_id = $1 WHERE branch_id = $2", [managerId, branchId]);

      // 6. Seed Employees
      const designations = ["Chef", "Server", "Cleaner", "Cashier"];
      for (let i = 0; i < 5; i++) {
        await db.query(
          `INSERT INTO employees (branch_id, name, email, designation, salary)
           VALUES ($1, $2, $3, $4, $5)`,
          [branchId, `Emp ${i+1} (${bData.name})`, `emp${i+1}.${branchId}@test.com`, designations[i % 4], 15000 + (Math.random() * 10000)]
        );
      }

      // 7. Seed Inventory
      const items = [
        { name: "Rice", unit: "kg", qty: 100, reorder: 20 },
        { name: "Oil", unit: "L", qty: 50, reorder: 10 },
        { name: "Chicken", unit: "kg", qty: 30, reorder: 15 },
        { name: "Spices", unit: "kg", qty: 10, reorder: 2 }
      ];
      for (const item of items) {
        await db.query(
          `INSERT INTO inventory (branch_id, product_name, quantity, unit, reorder_level)
           VALUES ($1, $2, $3, $4, $5)`,
          [branchId, item.name, item.qty, item.unit, item.reorder]
        );
      }

      // 8. Seed Sales (Last 30 days)
      const products = ["Burger", "Pizza", "Coffee", "Pasta"];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const numSales = 3 + Math.floor(Math.random() * 5);
        for (let s = 0; s < numSales; s++) {
          await db.query(
            `INSERT INTO sales (branch_id, receipt_no, product_name, customer_name, amount, payment_method, sale_date, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              branchId, 
              `RCP-${branchId}-${i}-${s}`, 
              products[Math.floor(Math.random() * 4)], 
              "Regular Customer", 
              150 + Math.random() * 500, 
              Math.random() > 0.5 ? "UPI" : "Cash", 
              date, 
              managerId
            ]
          );
        }
      }

      // 9. Seed Expenses
      const expTypes = ["Electricity", "Rent", "Maintenance", "Water"];
      for (const type of expTypes) {
        await db.query(
          `INSERT INTO expenses (branch_id, expense_type, amount, expense_date, description)
           VALUES ($1, $2, $3, NOW(), $4)`,
          [branchId, type, 2000 + Math.random() * 5000, `Monthly ${type} bill`]
        );
      }

      // 10. Seed Notifications
      await db.query(
        `INSERT INTO notifications (branch_id, message, type)
         VALUES ($1, $2, $3)`,
        [branchId, `New inventory update for ${bData.name}`, "INFO"]
      );
    }

    console.log("--- Seeding Completed Successfully ---");
    console.log("Credentials:");
    console.log("Owner: owner@test.com / password123");
    console.log("Manager: manager.bengaluru@test.com / password123");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seedData();
