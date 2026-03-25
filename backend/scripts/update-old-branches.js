const pool = require("../config/db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function updateOldBranches() {
  try {
    console.log("\n🔧 Old Branches Update Tool");
    console.log("============================\n");

    // Get all branches
    const result = await pool.query(
      `SELECT b.branch_id, b.branch_name, b.location, f.franchise_name
       FROM branches b
       JOIN franchises f ON b.franchise_id = f.franchise_id
       WHERE b.branch_name IS NULL OR b.location IS NULL
       ORDER BY b.created_at ASC`
    );

    if (result.rows.length === 0) {
      console.log("✅ All branches have complete data!\n");
      process.exit(0);
      return;
    }

    console.log(`Found ${result.rows.length} branches that need updating:\n`);

    for (const branch of result.rows) {
      console.log(`\n📍 Branch ID: ${branch.branch_id}`);
      console.log(`   Franchise: ${branch.franchise_name}`);
      console.log(`   Current Branch Name: ${branch.branch_name || "❌ NOT SET"}`);
      console.log(`   Current Location: ${branch.location || "❌ NOT SET"}`);

      let newName = branch.branch_name;
      let newLocation = branch.location;

      if (!newName) {
        newName = await askQuestion("   Enter branch name: ");
      }

      if (!newLocation) {
        newLocation = await askQuestion("   Enter location: ");
      }

      // Update the branch
      await pool.query(
        `UPDATE branches SET branch_name = $1, location = $2 WHERE branch_id = $3`,
        [newName, newLocation, branch.branch_id]
      );

      console.log(`   ✅ Updated!`);
    }

    console.log("\n✨ All branches updated successfully!\n");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error updating branches:", error.message);
    process.exit(1);
  }
}

updateOldBranches();
