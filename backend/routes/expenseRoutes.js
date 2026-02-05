const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =====================================
   ✅ GET expenses by branch (+ month)
   ===================================== */
router.get("/:branchId", async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query; // YYYY-MM (optional)

  try {
    let query = `
      SELECT expense_id, expense_type, amount, expense_date, description
      FROM expenses
      WHERE branch_id = $1
    `;
    let params = [branchId];

    // 🔥 Month-wise filter (NEW)
    if (month) {
      query += ` AND TO_CHAR(expense_date, 'YYYY-MM') = $2`;
      params.push(month);
    }

    query += ` ORDER BY expense_date DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

/* =====================================
   ✅ ADD expense (NEW)
   ===================================== */
router.post("/", async (req, res) => {
  const { branch_id, expense_type, amount, expense_date, description } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO expenses 
       (branch_id, expense_type, amount, expense_date, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [branch_id, expense_type, amount, expense_date, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding expense" });
  }
});

module.exports = router;
