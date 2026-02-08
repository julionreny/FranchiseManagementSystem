const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =====================================
   ✅ GET expenses by branch (month-wise optional)
   ===================================== */
router.get("/:branchId", async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query; // format: YYYY-MM

  try {
    let query = `
      SELECT 
        expense_id,
        expense_type,
        amount,
        expense_date,
        description
      FROM expenses
      WHERE branch_id = $1
    `;
    const params = [branchId];

    // ✅ Month-wise filter
    if (month) {
      query += ` AND TO_CHAR(expense_date, 'YYYY-MM') = $2`;
      params.push(month);
    }

    query += ` ORDER BY expense_date DESC`;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

/* =====================================
   ✅ ADD expense
   ===================================== */
router.post("/", async (req, res) => {
  const {
    branch_id,
    expense_type,
    amount,
    expense_date,
    description
  } = req.body;

  // 🔒 Basic validation
  if (!branch_id || !expense_type || !amount || !expense_date) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO expenses
      (branch_id, expense_type, amount, expense_date, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [branch_id, expense_type, amount, expense_date, description || ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ message: "Failed to add expense" });
  }
});

module.exports = router;
