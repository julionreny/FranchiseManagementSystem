const db = require("../config/db");
const axios = require("axios");


/* ======================================
   GET EXPENSES BY BRANCH (WITH MONTH)
====================================== */
exports.getExpensesByBranch = async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query;

  try {

    let query = `
      SELECT *
      FROM expenses
      WHERE branch_id = $1
    `;

    let values = [branchId];

    if (month) {
      const [year, mon] = month.split("-");

      query += `
        AND EXTRACT(YEAR FROM expense_date) = $2
        AND EXTRACT(MONTH FROM expense_date) = $3
      `;

      values.push(year, mon);
    }

    /* ⭐ PRIORITY SORTING (VERY IMPORTANT) */
    query += `
      ORDER BY
        CASE
          WHEN priority = 'high' THEN 1
          WHEN priority = 'medium' THEN 2
          WHEN priority = 'low' THEN 3
          ELSE 4
        END,
        expense_date DESC
    `;

    const result = await db.query(query, values);
    res.json(result.rows);

  } catch (error) {
    console.error("Expense fetch error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};


/* ======================================
   ADD EXPENSE WITH ML PRIORITY
====================================== */
exports.addExpense = async (req, res) => {

  const {
    branch_id,
    expense_type,
    amount,
    expense_date,
    description
  } = req.body;

  try {

    /* ⭐ CREATE FULL TEXT FOR ML */
    const mlText = `${expense_type} ${description || ""}`;

    let priority = "medium";   // ⭐ fallback priority

    try {

      /* ⭐ CALL ML SERVER */
      const mlResponse = await axios.post(
        "http://127.0.0.1:5002/predict-priority",
        { text: mlText }
      );

      priority = mlResponse.data.priority;

      console.log("ML Priority:", priority);

    } catch (mlError) {

      /* ⭐ IF ML SERVER DOWN — SYSTEM STILL WORKS */
      console.log("ML server error — using default priority");

    }

    /* ⭐ INSERT EXPENSE */
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
        description,
        priority
      ]
    );

    /* ⭐ OWNER NOTIFICATION */
    await db.query(
      `
      INSERT INTO notifications
      (branch_id, role_id, message, type)
      VALUES ($1, 1, $2, 'EXPENSE')
      `,
      [
        branch_id,
        `New ${priority.toUpperCase()} priority expense ₹${amount} for ${expense_type}`
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};