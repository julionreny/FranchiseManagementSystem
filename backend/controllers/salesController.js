const db = require("../config/db");

/* ============================
   GET SALES BY BRANCH (+ month)
   ============================ */
exports.getSalesByBranch = async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query;

  try {
    let query = `
      SELECT
        sale_id,
        receipt_no,
        product_name,
        customer_name,
        contact,
        amount,
        payment_method,
        sale_date
      FROM sales
      WHERE branch_id = $1
    `;
    const params = [branchId];

    if (month) {
      query += ` AND TO_CHAR(sale_date, 'YYYY-MM') = $2`;
      params.push(month);
    }

    query += " ORDER BY sale_date DESC";

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("ADD EXPENSE ERR:", err);
    res.status(500).json({ message: "Add expense failed", error: err.message, body: req.body });
  }
};

/* ============================
   ADD SALE (WITH RECEIPT NO)
   ============================ */
exports.addSale = async (req, res) => {
  const {
    branch_id,
    product_name,
    customer_name,
    contact,
    amount,
    payment_method,
    sale_date,
    created_by
  } = req.body;

  // ✅ Auto-generate receipt number
  const receiptNo = `RCPT-${new Date().getFullYear()}-${Date.now()}`;

  try {
    const result = await db.query(
      `
      INSERT INTO sales
      (
        receipt_no,
        branch_id,
        product_name,
        customer_name,
        contact,
        amount,
        payment_method,
        sale_date,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9, (SELECT user_id FROM users LIMIT 1)))
      RETURNING *
      `,
      [
        receiptNo,
        branch_id,
        product_name,
        customer_name || "Guest Customer",
        contact || "",
        parseFloat(amount) || 0,
        payment_method || "Cash",
        sale_date || new Date(),
        created_by || null
      ]
    );

    // Notify owner if sale is significant (> 10000)
    if (amount >= 10000) {
      await db.query(
  `INSERT INTO notifications (branch_id, role_id, message, type)
   VALUES ($1, $2, $3, $4)`,
  [
    branch_id,
    1,
    `High-value sale of ₹${amount} recorded for ${product_name}.`,
    "SALE"
  ]
);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ADD SALE ERR:", err);
    res.status(500).json({ message: "Failed to add sale", error: err.message, body: req.body });
  }
};
