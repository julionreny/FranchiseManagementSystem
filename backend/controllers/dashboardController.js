const db = require("../config/db");

/* =========================
   MANAGER DASHBOARD SUMMARY
========================= */
exports.getDashboardSummary = async (req, res) => {
  const { branchId } = req.params;

  try {
    const todaySales = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS total
       FROM sales
       WHERE branch_id=$1
       AND DATE(sale_date)=CURRENT_DATE`,
      [branchId]
    );

    const monthlySales = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS total
       FROM sales
       WHERE branch_id=$1
       AND DATE_TRUNC('month',sale_date)=DATE_TRUNC('month',CURRENT_DATE)`,
      [branchId]
    );

    const inventoryCount = await db.query(
      `SELECT COUNT(*) FROM inventory WHERE branch_id=$1`,
      [branchId]
    );

    const employeeCount = await db.query(
      `SELECT COUNT(*) FROM employees WHERE branch_id=$1`,
      [branchId]
    );

    res.json({
      todaySales: Number(todaySales.rows[0].total),
      monthlySales: Number(monthlySales.rows[0].total),
      inventoryCount: Number(inventoryCount.rows[0].count),
      employeeCount: Number(employeeCount.rows[0].count)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard summary failed" });
  }
};


/* =========================
   MANAGER SALES LAST 7 DAYS
========================= */
exports.getSalesLast7Days = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await db.query(
      `SELECT
        TO_CHAR(d,'Dy') AS day,
        COALESCE(SUM(s.amount),0) AS sales
       FROM generate_series(
          CURRENT_DATE-INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'
       ) d
       LEFT JOIN sales s
       ON DATE(s.sale_date)=d
       AND s.branch_id=$1
       GROUP BY d
       ORDER BY d`,
      [branchId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sales chart failed" });
  }
};


/* =========================
   MANAGER EXPENSE BREAKDOWN
========================= */
exports.getExpenseBreakdown = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await db.query(
      `SELECT expense_type AS name,
              SUM(amount) AS value
       FROM expenses
       WHERE branch_id=$1
       GROUP BY expense_type`,
      [branchId]
    );

    res.json(
      result.rows.map(r => ({
        name: r.name,
        value: Number(r.value)
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Expense chart failed" });
  }
};


/* =========================
   OWNER DASHBOARD STATS
========================= */
exports.getOwnerDashboardStats = async (req, res) => {
  const { franchiseId } = req.params;

  try {
    const result = await db.query(
      `SELECT
        COALESCE(SUM(s.amount),0) AS revenue,
        COALESCE((SELECT SUM(amount)
                  FROM expenses e
                  JOIN branches b ON e.branch_id=b.branch_id
                  WHERE b.franchise_id=$1),0) AS expenses,
        COUNT(DISTINCT emp.employee_id) AS employees,
        COUNT(DISTINCT br.branch_id) AS branches,
        COUNT(DISTINCT br.branch_id)
          FILTER (WHERE br.status='ACTIVE') AS active
       FROM branches br
       LEFT JOIN sales s ON s.branch_id=br.branch_id
       LEFT JOIN employees emp ON emp.branch_id=br.branch_id
       WHERE br.franchise_id=$1`,
      [franchiseId]
    );

    const r = result.rows[0];

    const revenue = Number(r.revenue);
    const expenses = Number(r.expenses);

    res.json({
      totalRevenue: revenue,
      totalBranches: Number(r.branches),
      activeBranches: Number(r.active),
      totalEmployees: Number(r.employees),
      efficiencyScore:
        revenue > 0
          ? Math.round(((revenue - expenses) / revenue) * 100)
          : 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Owner stats failed" });
  }
};


/* =========================
   ⭐ OWNER MULTI BRANCH TREND (FINAL FIX)
========================= */
exports.getOwnerBranchTrend = async (req, res) => {
  const { franchiseId } = req.params;

  try {

    const result = await db.query(
      `
      SELECT
        b.branch_name,
        DATE(s.sale_date) AS sale_date,
        COALESCE(SUM(s.amount),0) AS revenue

      FROM branches b

      LEFT JOIN sales s
      ON s.branch_id = b.branch_id
      AND s.sale_date >= CURRENT_DATE - INTERVAL '29 days'

      WHERE b.franchise_id = $1

      GROUP BY b.branch_name, DATE(s.sale_date)

      ORDER BY sale_date
      `,
      [franchiseId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("TREND ERROR:", err);
    res.status(500).json({ message: "Trend fetch failed" });
  }
};

/* =========================
   OWNER BRANCH PERFORMANCE
========================= */
exports.getOwnerBranchPerformance = async (req, res) => {

  const { franchiseId } = req.params;

  try {

    const result = await db.query(
      `
      SELECT
        b.branch_id,
        b.location AS branch_name,
        COALESCE(SUM(s.amount),0) AS revenue,
        COALESCE(
          (SELECT SUM(amount)
           FROM expenses e
           WHERE e.branch_id=b.branch_id),0
        ) AS expenses,
        (SELECT COUNT(*)
         FROM employees emp
         WHERE emp.branch_id=b.branch_id) AS employee_count

      FROM branches b
      LEFT JOIN sales s
      ON s.branch_id=b.branch_id

      WHERE b.franchise_id=$1
      GROUP BY b.branch_id, branch_name
      ORDER BY revenue DESC
      `,
      [franchiseId]
    );

    res.json(
      result.rows.map(r => ({
        ...r,
        revenue: Number(r.revenue),
        expenses: Number(r.expenses),
        profit: Number(r.revenue) - Number(r.expenses),
        employee_count: Number(r.employee_count)
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Branch performance failed" });
  }

};