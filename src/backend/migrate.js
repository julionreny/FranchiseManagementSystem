const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("🔄 Starting database migration...");

    // Read the SQL file
    const sqlPath = path.join(__dirname, "migrations", "init_database.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the SQL
    await pool.query(sql);

    console.log("✅ Database migration completed successfully!");
    console.log("✨ All tables created and configured.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
