const pool = require("../config/db");

async function checkAndFixBranches() {
  try {
    console.log("🔍 Checking branches table structure...");

    // Check if the table exists and what columns it has
    const checkTable = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'branches'
       ORDER BY ordinal_position`
    );

    console.log("\n📋 Current branches table columns:");
    checkTable.rows.forEach(col => {
      console.log(`   • ${col.column_name} (${col.data_type})`);
    });

    // Check if columns exist
    const hasColumnCheck = await pool.query(
      `SELECT COUNT(*) FROM information_schema.columns 
       WHERE table_name = 'branches' AND column_name = 'branch_name'`
    );

    const hasBranchName = hasColumnCheck.rows[0].count > 0;

    if (!hasBranchName) {
      console.log("\n⚠️  Missing branch_name column! Adding...");
      await pool.query(
        `ALTER TABLE branches ADD COLUMN IF NOT EXISTS branch_name VARCHAR(255)`
      );
      console.log("✅ Added branch_name column");
    }

    // Check if location column exists
    const hasLocationCheck = await pool.query(
      `SELECT COUNT(*) FROM information_schema.columns 
       WHERE table_name = 'branches' AND column_name = 'location'`
    );

    const hasLocation = hasLocationCheck.rows[0].count > 0;

    if (!hasLocation) {
      console.log("⚠️  Missing location column! Adding...");
      await pool.query(
        `ALTER TABLE branches ADD COLUMN IF NOT EXISTS location VARCHAR(255)`
      );
      console.log("✅ Added location column");
    }

    // Check existing branches
    const existingBranches = await pool.query(
      "SELECT branch_id, branch_name, location FROM branches"
    );

    console.log(`\n📊 Found ${existingBranches.rows.length} branches in database`);
    
    if (existingBranches.rows.length > 0) {
      console.log("\n📍 Existing branches:");
      existingBranches.rows.forEach(branch => {
        const name = branch.branch_name || "❌ NO NAME";
        const location = branch.location || "❌ NO LOCATION";
        console.log(`   Branch ID ${branch.branch_id}: ${name} - ${location}`);
      });

      // Check for branches with missing data
      const missingData = existingBranches.rows.filter(
        b => !b.branch_name || !b.location
      );

      if (missingData.length > 0) {
        console.log(`\n⚠️  ${missingData.length} branches have missing data`);
        console.log("   These branches need to be updated or recreated with proper data");
      }
    }

    console.log("\n✅ Database check complete!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error checking branches:", error.message);
    process.exit(1);
  }
}

checkAndFixBranches();
