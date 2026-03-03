const db = require("../config/db");

/*
GET all expenses for franchise owner
Shows expenses from ALL branches of that franchise
Includes branch location
*/

exports.getOwnerExpenses = async (req, res) => {

  const { franchiseId } = req.params;

  try {

    const result = await db.query(
      `
      SELECT
        e.expense_id,
        e.expense_type,
        e.amount,
        e.expense_date,
        e.description,
        b.branch_id,
        b.location AS branch_location

      FROM expenses e

      JOIN branches b
      ON e.branch_id = b.branch_id

      WHERE b.franchise_id = $1

      ORDER BY e.expense_date DESC
      `,
      [franchiseId]
    );

    res.json(result.rows);

  }
  catch (err) {

    console.error("Owner expenses error:", err);

    res.status(500).json({
      message: "Failed to fetch franchise expenses"
    });

  }

};