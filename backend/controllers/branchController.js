const pool = require("../config/db");
const crypto = require("crypto");

exports.createBranch = async (req, res) => {
  const { franchise_id, branch_name, location } = req.body;

  try {
    // Validate input
    if (!franchise_id || !branch_name || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Generate invite code
    const inviteCode = crypto.randomBytes(4).toString("hex");

    // Insert branch
    const result = await pool.query(
      `INSERT INTO branches 
       (franchise_id, branch_name, location, manager_invite_code, is_code_used, status)
       VALUES ($1, $2, $3, $4, FALSE, 'ACTIVE')
       RETURNING branch_id, manager_invite_code`,
      [franchise_id, branch_name, location, inviteCode]
    );

    res.status(201).json({
      message: "Branch created successfully",
      branch_id: result.rows[0].branch_id,
      invite_code: result.rows[0].manager_invite_code
    });

  } catch (err) {
    console.error("CREATE BRANCH ERROR:", err);
    res.status(500).json({ error: "Branch creation failed" });
  }
};
