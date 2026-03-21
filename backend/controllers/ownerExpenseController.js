const db = require("../config/db");

/*
   GET ALL EXPENSES FOR FRANCHISE OWNER
   Shows expenses from ALL branches
   Includes branch location + PRIORITY
   Sorted by DATE (latest first)
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
        e.priority,                 -- ⭐ VERY IMPORTANT
        b.branch_id,
        b.location AS branch_location

      FROM expenses e

      JOIN branches b
        ON e.branch_id = b.branch_id

      WHERE b.franchise_id = $1

      ORDER BY
        CASE
          WHEN e.priority = 'HIGH' THEN 1
          WHEN e.priority = 'MEDIUM' THEN 2
          WHEN e.priority = 'LOW' THEN 3
          ELSE 4
        END,
        e.expense_date DESC
      `,
      [franchiseId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error("Owner expenses error:", err);

    res.status(500).json({
      message: "Failed to fetch franchise expenses"
    });

  }

};