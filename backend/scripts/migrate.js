const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("🔄 Starting database migration...");

    // Get all migration files in order
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = [
      "init_database.sql",
      "add_manager_invite_cols.sql",
      "add_reset_token.sql",
      "add_manager_email.sql"
    ];

    // Run each migration
    for (const file of migrationFiles) {
      const sqlPath = path.join(migrationsDir, file);
      if (fs.existsSync(sqlPath)) {
        console.log(`\n📄 Running migration: ${file}`);
        const sql = fs.readFileSync(sqlPath, "utf8");
        await pool.query(sql);
        console.log(`✅ ${file} completed`);
      }
    }

    console.log("\n✅ Database migration completed successfully!");
    console.log("✨ All tables created and configured.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
