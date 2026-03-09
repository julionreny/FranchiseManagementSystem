const db = require("../config/db");

/* =========================
   GET DASHBOARD SUMMARY (BRANCH - for Manager)
========================= */
exports.getDashboardSummary = async (req, res) => {
  const { branchId } = req.params;
  try {
    /* TODAY SALES */
    const todaySales = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM sales
       WHERE branch_id = $1 AND DATE(sale_date) = CURRENT_DATE`,
      [branchId]
    );

    /* MONTHLY SALES */
    const monthlySales = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM sales
       WHERE branch_id = $1 AND DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE)`,
      [branchId]
    );

    /* INVENTORY COUNT */
    const inventoryCount = await db.query(
      `SELECT COUNT(*) AS total FROM inventory WHERE branch_id = $1`,
      [branchId]
    );

    /* EMPLOYEE COUNT */
    const employeeCount = await db.query(
      `SELECT COUNT(*) AS total FROM employees WHERE branch_id = $1`,
      [branchId]
    );

    res.json({
      todaySales: Number(todaySales.rows[0].total),
      monthlySales: Number(monthlySales.rows[0].total),
      inventoryCount: Number(inventoryCount.rows[0].total),
      employeeCount: Number(employeeCount.rows[0].total),
    });
  } catch (err) {
    console.error("Dashboard Summary Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};

/* =========================
   GET SALES LAST 7 DAYS (BRANCH - for Manager)
========================= */
exports.getSalesLast7Days = async (req, res) => {
  const { branchId } = req.params;
  try {
    const result = await db.query(
      `SELECT
         TO_CHAR(d.date, 'Dy') AS day,
         COALESCE(SUM(s.amount), 0) AS sales
       FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d(date)
       LEFT JOIN sales s ON s.sale_date = d.date AND s.branch_id = $1
       GROUP BY d.date ORDER BY d.date`,
      [branchId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales chart" });
  }
};

/* =========================
   GET EXPENSE BREAKDOWN (BRANCH - for Manager)
========================= */
exports.getExpenseBreakdown = async (req, res) => {
  const { branchId } = req.params;
  try {
    const result = await db.query(
      `SELECT expense_type AS name, SUM(amount) AS value
       FROM expenses WHERE branch_id = $1
       GROUP BY expense_type`,
      [branchId]
    );
    const formatted = result.rows.map(row => ({
      name: row.name,
      value: Number(row.value)
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Expense Chart Error:", err);
    res.status(500).json({ message: "Failed to fetch expense breakdown" });
  }
};

/* =========================
   OWNER: FRANCHISE SUMMARY STATS
========================= */
exports.getOwnerDashboardStats = async (req, res) => {
  const { franchiseId } = req.params;
  try {
    const statsResult = await db.query(
      `WITH branch_list AS (
         SELECT branch_id FROM branches WHERE franchise_id = $1
       ),
       rev AS (
         SELECT SUM(amount) AS total FROM sales 
         WHERE branch_id IN (SELECT branch_id FROM branch_list)
       ),
       exp AS (
         SELECT SUM(amount) AS total FROM expenses 
         WHERE branch_id IN (SELECT branch_id FROM branch_list)
       ),
       emp AS (
         SELECT COUNT(*) AS total FROM employees 
         WHERE branch_id IN (SELECT branch_id FROM branch_list)
       ),
       br AS (
         SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active 
         FROM branches WHERE franchise_id = $1
       )
       SELECT 
         COALESCE((SELECT total FROM rev), 0) AS total_revenue,
         COALESCE((SELECT total FROM exp), 0) AS total_expenses,
         (SELECT total FROM emp) AS total_employees,
         (SELECT total FROM br) AS total_branches,
         (SELECT active FROM br) AS active_branches`,
      [franchiseId]
    );

    const s = statsResult.rows[0];
    const totalRevenue = Number(s.total_revenue);
    const totalExpenses = Number(s.total_expenses);
    const efficiencyScore = totalRevenue > 0
      ? Math.min(99, Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100 + 50))
      : 92;

    res.json({
      totalRevenue,
      totalBranches: Number(s.total_branches),
      activeBranches: Number(s.active_branches),
      totalEmployees: Number(s.total_employees),
      efficiencyScore,
    });
  } catch (err) {
    console.error("Owner dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch owner stats" });
  }
};

/* =========================
   OWNER: MULTI-BRANCH 30-DAY PERFORMANCE
========================= */
exports.getOwnerBranchTrend = async (req, res) => {
  const { franchiseId } = req.params;
  try {
    const result = await db.query(
      `SELECT
         b.branch_id, b.branch_name, b.location,
         TO_CHAR(d.date, 'Mon DD') AS name,
         COALESCE(SUM(s.amount), 0) AS revenue
       FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') AS d(date)
       CROSS JOIN branches b
       LEFT JOIN sales s ON s.branch_id = b.branch_id AND DATE(s.sale_date) = d.date
       WHERE b.franchise_id = $1
       GROUP BY b.branch_id, b.branch_name, b.location, d.date
       ORDER BY d.date`,
      [franchiseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Owner branch trend error:", err);
    res.status(500).json({ message: "Failed to fetch branch trend" });
  }
};

/* =========================
   OWNER: PER-BRANCH PERFORMANCE
========================= */
exports.getOwnerBranchPerformance = async (req, res) => {
  const { franchiseId } = req.params;
  try {
    const result = await db.query(
      `SELECT
         b.branch_id, b.branch_name, b.location, b.status, b.manager_email,
         COALESCE((SELECT SUM(amount) FROM sales WHERE branch_id = b.branch_id), 0) AS revenue,
         COALESCE((SELECT SUM(amount) FROM expenses WHERE branch_id = b.branch_id), 0) AS expenses,
         (SELECT COUNT(*) FROM employees WHERE branch_id = b.branch_id) AS employee_count
       FROM branches b
       WHERE b.franchise_id = $1
       ORDER BY revenue DESC`,
      [franchiseId]
    );

    const rows = result.rows.map(r => ({
      ...r,
      revenue: Number(r.revenue),
      expenses: Number(r.expenses),
      profit: Number(r.revenue) - Number(r.expenses),
      employee_count: Number(r.employee_count),
    }));

    res.json(rows);
  } catch (err) {
    console.error("Owner branch performance error:", err);
    res.status(500).json({ message: "Failed to fetch branch performance" });
  }
};
