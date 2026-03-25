const db = require("../config/db");
const bcrypt = require("bcrypt");

async function addExtraData() {
  try {
    const hashedPass = await bcrypt.hash("password123", 10);
    const franchiseId = 12; // From my previous check

    const extraBranches = [
      { name: "Jaipur Junction", loc: "Pink City" },
      { name: "Lucknow Lane", loc: "Gomti Nagar" }
    ];

    for (const bData of extraBranches) {
      const branchRes = await db.query(
        `INSERT INTO branches (franchise_id, branch_name, location, status)
         VALUES ($1, $2, $3, 'ACTIVE') RETURNING branch_id`,
        [franchiseId, bData.name, bData.loc]
      );
      const branchId = branchRes.rows[0].branch_id;

      const managerEmail = `manager.${bData.name.split(' ')[0].toLowerCase()}@test.com`;
      const managerRes = await db.query(
        `INSERT INTO users (name, email, password, role_id, branch_id, status)
         VALUES ($1, $2, $3, 2, $4, 'ACTIVE') RETURNING user_id`,
        [`Manager ${bData.name.split(' ')[0]}`, managerEmail, hashedPass, branchId]
      );
      const managerId = managerRes.rows[0].user_id;

      await db.query("UPDATE branches SET manager_id = $1 WHERE branch_id = $2", [managerId, branchId]);
      
      console.log(`Added Branch: ${bData.name} with Manager: ${managerEmail}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addExtraData();
