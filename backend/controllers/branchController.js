const pool = require("../config/db");
const crypto = require("crypto");
const { sendManagerInviteEmail } = require("../utils/emailService");

exports.getBranches = async (req, res) => {
  const { franchiseId } = req.params;

  try {
    console.log(`📍 getBranches called with franchiseId: ${franchiseId}`);
    
    const result = await pool.query(
      `SELECT 
        b.branch_id, 
        b.franchise_id, 
        COALESCE(b.branch_name, 'Branch ' || b.branch_id) AS branch_name,
        COALESCE(b.location, 'No location set') AS location, 
        b.manager_id,
        b.manager_email,
        b.manager_invite_code,
        b.is_code_used,
        b.status,
        b.created_at,
        COALESCE((SELECT SUM(amount) FROM sales s WHERE s.branch_id = b.branch_id), 0) as revenue,
        COALESCE((SELECT SUM(amount) FROM expenses e WHERE e.branch_id = b.branch_id), 0) as expenses
       FROM branches b
       WHERE b.franchise_id = $1
       ORDER BY b.created_at DESC`,
      [franchiseId]
    );

    console.log(`✅ Query returned ${result.rows.length} branches`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ FETCH BRANCHES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch branches", details: err.message });
  }
};

exports.createBranch = async (req, res) => {
  const { franchise_id, branch_name, location, manager_email } = req.body;

  try {
    // Validate input
    if (!franchise_id || !branch_name || !location || !manager_email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Generate invite code
    const inviteCode = crypto.randomBytes(4).toString("hex");

    // Insert branch
    const result = await pool.query(
      `INSERT INTO branches 
       (franchise_id, branch_name, location, manager_email, manager_invite_code, is_code_used, status)
       VALUES ($1, $2, $3, $4, $5, FALSE, 'ACTIVE')
       RETURNING branch_id, manager_invite_code`,
      [franchise_id, branch_name, location, manager_email, inviteCode]
    );

    // Send invitation email
    try {
      await sendManagerInviteEmail(manager_email, inviteCode, branch_name);
    } catch (emailErr) {
      console.error("FAILED TO SEND INVITE EMAIL:", emailErr);
      // We still return success for branch creation, but note the email failure in logs
    }

    // Create notification for owner (role_id = 1)
    await pool.query(
      `INSERT INTO notifications (branch_id, role_id, message, type)
       VALUES ($1, 1, $2, 'INFO')`,
      [result.rows[0].branch_id, `New branch "${branch_name}" created. Invite token: ${inviteCode}`]
    );

    res.status(201).json({
      message: "Branch created successfully and invitation sent",
      branch_id: result.rows[0].branch_id,
      invite_code: result.rows[0].manager_invite_code
    });

  } catch (err) {
    console.error("CREATE BRANCH ERROR:", err);
    res.status(500).json({ error: "Branch creation failed" });
  }
};

exports.updateBranch = async (req, res) => {
  const { branchId } = req.params;
  const { branch_name, location, manager_email, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE branches 
       SET branch_name = COALESCE($1, branch_name), 
           location = COALESCE($2, location), 
           manager_email = COALESCE($3, manager_email),
           status = COALESCE($4, status)
       WHERE branch_id = $5
       RETURNING *`,
      [branch_name, location, manager_email, status, branchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Branch not found" });
    }

    res.json({
      message: "Branch updated successfully",
      branch: result.rows[0]
    });
  } catch (err) {
    console.error("UPDATE BRANCH ERROR:", err);
    res.status(500).json({ error: "Failed to update branch" });
  }
};

exports.deleteBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    // 1. Delete associated notifications, sales, expenses, inventory, employees
    // Order matters for FK constraints if CASCADE is not on
    await pool.query("DELETE FROM notifications WHERE branch_id = $1", [branchId]);
    await pool.query("DELETE FROM sales WHERE branch_id = $1", [branchId]);
    await pool.query("DELETE FROM expenses WHERE branch_id = $1", [branchId]);
    await pool.query("DELETE FROM inventory WHERE branch_id = $1", [branchId]);
    await pool.query("DELETE FROM employees WHERE branch_id = $1", [branchId]);
    
    // 2. Unlink manager if exists (users table)
    await pool.query("UPDATE users SET branch_id = NULL WHERE branch_id = $1", [branchId]);

    // 3. Delete branch
    const result = await pool.query("DELETE FROM branches WHERE branch_id = $1 RETURNING branch_name", [branchId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Branch not found" });
    }

    res.json({ message: `Branch "${result.rows[0].branch_name}" deleted successfully` });
  } catch (err) {
    console.error("DELETE BRANCH ERROR:", err);
    res.status(500).json({ error: "Failed to delete branch" });
  }
};

exports.resetInviteCode = async (req, res) => {
  const { branchId } = req.params;
  const inviteCode = crypto.randomBytes(4).toString("hex");

  try {
    const result = await pool.query(
      `UPDATE branches 
       SET manager_invite_code = $1, is_code_used = FALSE 
       WHERE branch_id = $2 
       RETURNING branch_name, manager_email`,
      [inviteCode, branchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const { branch_name, manager_email } = result.rows[0];

    // Resend email
    try {
      await sendManagerInviteEmail(manager_email, inviteCode, branch_name);
    } catch (e) {
      console.error("Email resend failed:", e);
    }

    res.json({ 
      message: "Invite code reset and email resent", 
      invite_code: inviteCode 
    });
  } catch (err) {
    console.error("RESET INVITE ERROR:", err);
    res.status(500).json({ error: "Failed to reset invite code" });
  }
};
