const db = require("../config/db");


/* =========================
   GET DASHBOARD SUMMARY
========================= */

exports.getDashboardSummary = async (req, res) => {

  const { branchId } = req.params;

  try {

    /* TODAY SALES — FIXED */

    const todaySales = await db.query(
      `
      SELECT COALESCE(SUM(amount),0) AS total
      FROM sales
      WHERE branch_id = $1
      AND DATE(sale_date) = CURRENT_DATE
      `,
      [branchId]
    );


    /* MONTHLY SALES — FIXED */

    const monthlySales = await db.query(
      `
      SELECT COALESCE(SUM(amount),0) AS total
      FROM sales
      WHERE branch_id = $1
      AND DATE_TRUNC('month', sale_date)
          = DATE_TRUNC('month', CURRENT_DATE)
      `,
      [branchId]
    );


    /* INVENTORY COUNT */

    const inventoryCount = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM inventory
      WHERE branch_id = $1
      `,
      [branchId]
    );


    /* EMPLOYEE COUNT */

    const employeeCount = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM employees
      WHERE branch_id = $1
      `,
      [branchId]
    );


    res.json({

      todaySales:
        Number(todaySales.rows[0].total),

      monthlySales:
        Number(monthlySales.rows[0].total),

      inventoryCount:
        Number(inventoryCount.rows[0].total),

      employeeCount:
        Number(employeeCount.rows[0].total),

    });

  }
  catch (err) {

    console.error("Dashboard Summary Error:", err);

    res.status(500).json({
      message: "Failed to fetch dashboard summary"
    });

  }

};



/* =========================
   GET SALES LAST 7 DAYS
========================= */

exports.getSalesLast7Days = async (req, res) => {

  const { branchId } = req.params;

  try {

    const result = await db.query(
      `
      SELECT
        TO_CHAR(d.date, 'Dy') AS day,
        COALESCE(SUM(s.amount), 0) AS sales
      FROM
        generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'
        ) AS d(date)
      LEFT JOIN sales s
        ON s.sale_date = d.date
        AND s.branch_id = $1
      GROUP BY d.date
      ORDER BY d.date
      `,
      [branchId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch sales chart"
    });

  }

};



/* =========================
   GET EXPENSE BREAKDOWN
========================= */

exports.getExpenseBreakdown = async (req, res) => {

  const { branchId } = req.params;

  try {

    const result = await db.query(
      `
      SELECT
        expense_type AS name,
        SUM(amount) AS value
      FROM expenses
      WHERE branch_id = $1
      GROUP BY expense_type
      `
      ,
      [branchId]
    );


    /* Convert string to number */

    const formatted = result.rows.map(row => ({
      name: row.name,
      value: Number(row.value)
    }));


    res.json(formatted);

  }
  catch (err) {

    console.error("Expense Chart Error:", err);

    res.status(500).json({
      message: "Failed to fetch expense breakdown"
    });

  }

};
