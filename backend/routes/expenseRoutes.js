const express = require("express");
const router = express.Router();
const db = require("../config/db");
const axios = require("axios");

/* =====================================
   GET expenses by branch
===================================== */
router.get("/:branchId", async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query;

  try {
    let query = `
      SELECT
        expense_id,
        expense_type,
        amount,
        expense_date,
        description,
        priority
      FROM expenses
      WHERE branch_id = $1
    `;

    const params = [branchId];

    if (month) {
      query += ` AND TO_CHAR(expense_date,'YYYY-MM') = $2`;
      params.push(month);
    }

    query += ` ORDER BY expense_date DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Fetch expense failed" });
  }
});

/* =====================================
   ADD expense WITH ML PRIORITY
===================================== */
router.post("/", async (req, res) => {
  const {
    branch_id,
    expense_type,
    amount,
    expense_date,
    description
  } = req.body;

  try {

    const priority = "medium";

    /* ⭐ INSERT INTO DB */
    const result = await db.query(
      `
      INSERT INTO expenses
      (branch_id, expense_type, amount, expense_date, description, priority)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        branch_id,
        expense_type,
        amount,
        expense_date,
        description || "",
        priority
      ]
    );

    /* ⭐ NOTIFICATION */
    await db.query(
      `INSERT INTO notifications (branch_id, role_id, message, type)
       VALUES ($1,1,$2,'EXPENSE')`,
      [
        branch_id,
        `New ${priority.toUpperCase()} expense ₹${amount} : ${expense_type}`
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.log("Add expense error:", err.message);
    res.status(500).json({ message: "Add expense failed" });
  }
});

module.exports = router;