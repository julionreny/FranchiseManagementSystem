const db = require("../config/db");

/*
GET all sales for franchise owner
Shows sales from ALL branches of that franchise
Includes branch location and supports month filtering
*/

exports.getOwnerSales = async (req, res) => {
  const { franchiseId } = req.params;
  const { month } = req.query;

  try {
    let query = `
      SELECT
        s.sale_id,
        s.receipt_no,
        s.product_name,
        s.customer_name,
        s.contact,
        s.amount,
        s.payment_method,
        s.sale_date,
        b.branch_id,
        b.location AS branch_location

      FROM sales s

      JOIN branches b
      ON s.branch_id = b.branch_id

      WHERE b.franchise_id = $1
    `;

    const params = [franchiseId];

    if (month) {
      query += ` AND TO_CHAR(s.sale_date, 'YYYY-MM') = $2`;
      params.push(month);
    }

    query += " ORDER BY s.sale_date DESC";

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Owner sales error:", err);
    res.status(500).json({
      message: "Failed to fetch franchise sales",
    });
  }
};
