const axios = require("axios");
const pool = require("../config/db");

async function testBranchesAPI() {
  try {
    console.log("\n🔍 DEBUGGING BRANCHES ISSUE");
    console.log("================================\n");

    // Get all franchises
    console.log("📋 Checking franchises in database...");
    const franchises = await pool.query("SELECT * FROM franchises");
    console.log(`✅ Found ${franchises.rows.length} franchises`);
    franchises.rows.forEach(f => {
      console.log(`   • Franchise ID: ${f.franchise_id}, Name: ${f.franchise_name}, Owner: ${f.owner_id}`);
    });

    // Get all branches
    console.log("\n📍 Checking branches in database...");
    const branches = await pool.query(
      `SELECT b.*, f.franchise_name FROM branches b 
       LEFT JOIN franchises f ON b.franchise_id = f.franchise_id`
    );
    console.log(`✅ Found ${branches.rows.length} branches`);
    branches.rows.forEach(b => {
      console.log(`   • Branch ID: ${b.branch_id}, Name: ${b.branch_name}, Location: ${b.location}, Franchise: ${b.franchise_name}`);
    });

    // Test API endpoint
    if (franchises.rows.length > 0) {
      const testFranchiseId = franchises.rows[0].franchise_id;
      console.log(`\n🧪 Testing API endpoint for franchise ${testFranchiseId}...`);
      
      try {
        const response = await axios.get(
          `http://localhost:5000/api/branches/franchise/${testFranchiseId}`
        );
        console.log(`✅ API Response:`, response.data);
      } catch (apiErr) {
        console.log(`❌ API Error:`, apiErr.message);
        if (apiErr.response) {
          console.log(`   Status: ${apiErr.response.status}`);
          console.log(`   Data:`, apiErr.response.data);
        }
      }
    }

    console.log("\n================================");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

testBranchesAPI();
