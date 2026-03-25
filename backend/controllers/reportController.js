const pool = require("../config/db");

const getReports = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const q = 'SELECT * FROM hq_reports WHERE franchise_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(q, [franchiseId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const createReport = async (req, res) => {
  try {
    const { franchiseId, title, type, status, summary, tags } = req.body;

    const countRes = await pool.query('SELECT COUNT(*) FROM hq_reports');
    const count = parseInt(countRes.rows[0].count, 10) + 1;
    const year = new Date().getFullYear();
    const reportId = `REP-${year}-${count.toString().padStart(3, '0')}`;

    const q = `
      INSERT INTO hq_reports (report_id, franchise_id, title, type, status, summary, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const result = await pool.query(q, [reportId, franchiseId, title, type, status || 'Published', summary, tags || []]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const generateAutomatedReport = async (req, res) => {
  try {
    const { franchiseId, branchId, timelineDays, title, type } = req.body;
    const days = parseInt(timelineDays, 10) || 30;

    const params = [franchiseId];
    let branchCondition = '';
    if (branchId !== 'ALL') {
      params.push(branchId);
      branchCondition = `AND b.branch_id = $${params.length}`;
    }

    // ─── 1. Revenue & Expenses ───────────────────────────────────────────────
    const [revRes, expRes] = await Promise.all([
      pool.query(`
        SELECT COALESCE(SUM(s.amount), 0) AS total, COUNT(*) AS tx_count
        FROM sales s JOIN branches b ON s.branch_id = b.branch_id
        WHERE b.franchise_id = $1 ${branchCondition}
          AND s.sale_date >= CURRENT_DATE - INTERVAL '${days} days'
      `, params),
      pool.query(`
        SELECT COALESCE(SUM(e.amount), 0) AS total
        FROM expenses e JOIN branches b ON e.branch_id = b.branch_id
        WHERE b.franchise_id = $1 ${branchCondition}
          AND e.expense_date >= CURRENT_DATE - INTERVAL '${days} days'
      `, params),
    ]);

    const revenue    = Number(revRes.rows[0].total);
    const txCount    = Number(revRes.rows[0].tx_count);
    const expenses   = Number(expRes.rows[0].total);
    const profit     = revenue - expenses;
    const margin     = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0.0";
    const avgOrder   = txCount > 0 ? Math.round(revenue / txCount) : 0;

    // ─── 2. Employee Headcount ───────────────────────────────────────────────
    const empRes = await pool.query(`
      SELECT COUNT(*) AS total
      FROM employees e JOIN branches b ON e.branch_id = b.branch_id
      WHERE b.franchise_id = $1 ${branchCondition}
    `, params);
    const employees = Number(empRes.rows[0].total);

    // ─── 3. Inventory Snapshot ───────────────────────────────────────────────
    const invRes = await pool.query(`
      SELECT COUNT(*) AS item_count, COALESCE(SUM(quantity), 0) AS total_units
      FROM inventory i JOIN branches b ON i.branch_id = b.branch_id
      WHERE b.franchise_id = $1 ${branchCondition}
    `, params);
    const inventoryItems = Number(invRes.rows[0].item_count);
    const inventoryUnits = Number(invRes.rows[0].total_units);

    // ─── 4. Top 3 Expense Categories ────────────────────────────────────────
    const expCatRes = await pool.query(`
      SELECT e.expense_type, COALESCE(SUM(e.amount), 0) AS cat_total
      FROM expenses e JOIN branches b ON e.branch_id = b.branch_id
      WHERE b.franchise_id = $1 ${branchCondition}
        AND e.expense_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY e.expense_type
      ORDER BY cat_total DESC
      LIMIT 3
    `, params);
    const expCats = expCatRes.rows.map(r => `${r.expense_type} (₹${Number(r.cat_total).toLocaleString("en-IN")})`);

    // ─── 5. Branch Performance (only when scope = ALL) ───────────────────────
    let branchPerf = [];
    let branchCountStr = "a scoped branch";
    if (branchId === 'ALL') {
      const brRes = await pool.query(
        `SELECT COUNT(*) AS total FROM branches WHERE franchise_id = $1 AND status = 'ACTIVE'`,
        [franchiseId]
      );
      branchCountStr = `${brRes.rows[0].total} active branches`;

      const perfRes = await pool.query(`
        SELECT
          b.branch_name,
          COALESCE(SUM(s.amount), 0) AS rev,
          COALESCE((SELECT SUM(amount) FROM expenses e WHERE e.branch_id = b.branch_id
                    AND e.expense_date >= CURRENT_DATE - INTERVAL '${days} days'), 0) AS exp
        FROM branches b
        LEFT JOIN sales s ON s.branch_id = b.branch_id
          AND s.sale_date >= CURRENT_DATE - INTERVAL '${days} days'
        WHERE b.franchise_id = $1
        GROUP BY b.branch_id, b.branch_name
        ORDER BY rev DESC
      `, [franchiseId]);

      branchPerf = perfRes.rows.map(r => ({
        name: r.branch_name,
        revenue: Number(r.rev),
        expenses: Number(r.exp),
        profit: Number(r.rev) - Number(r.exp),
        margin: Number(r.rev) > 0
          ? (((Number(r.rev) - Number(r.exp)) / Number(r.rev)) * 100).toFixed(1)
          : "0.0",
      }));
    }

    // ─── Build Summary by Report Type ────────────────────────────────────────
    const fmtINR = v => `₹${Number(v).toLocaleString("en-IN")}`;

    const branchBlock = branchPerf.length > 0 ? `
TOP BRANCH PERFORMANCE:
${branchPerf.slice(0, 3).map((b, i) =>
  `  ${i + 1}. ${b.name} — Revenue: ${fmtINR(b.revenue)} | Net Profit: ${fmtINR(b.profit)} | Margin: ${b.margin}%`
).join("\n")}
${branchPerf.length > 1
  ? `\nLOWEST PERFORMING BRANCH:\n  • ${branchPerf[branchPerf.length - 1].name} — Revenue: ${fmtINR(branchPerf[branchPerf.length - 1].revenue)}, Profit: ${fmtINR(branchPerf[branchPerf.length - 1].profit)}`
  : ''}` : '';

    let summaryText = '';

    if (type === 'Financial') {
      summaryText = `[AUTOMATED FINANCIAL ANALYSIS]
Timeline: Last ${days} Days
Scope: ${branchId === 'ALL' ? `Entire Franchise Network (${branchCountStr})` : `Branch ID: ${branchId}`}

REVENUE & PROFITABILITY:
  • Total Revenue Generated:     ${fmtINR(revenue)}
  • Total Operational Expenses:  ${fmtINR(expenses)}
  • Net Operating Profit:        ${fmtINR(profit)}
  • Profit Margin:               ${margin}%
  • Total Sales Transactions:    ${txCount.toLocaleString()}
  • Average Order Value:         ${fmtINR(avgOrder)}

COST BREAKDOWN — TOP EXPENSE CATEGORIES:
${expCats.length > 0 ? expCats.map(c => `  • ${c}`).join("\n") : "  • No expense data available."}
${branchBlock}

FINANCIAL ASSESSMENT:
${profit > 0
  ? `The franchise network operated at a NET SURPLUS of ${fmtINR(profit)} (${margin}% margin). Financial health is positive.`
  : `The franchise operated at a NET DEFICIT of ${fmtINR(Math.abs(profit))}. Cost-reduction measures are recommended immediately.`}`;

    } else if (type === 'Operations') {
      summaryText = `[AUTOMATED OPERATIONS ANALYSIS]
Timeline: Last ${days} Days
Scope: ${branchId === 'ALL' ? `Entire Franchise Network (${branchCountStr})` : `Branch ID: ${branchId}`}

WORKFORCE STATUS:
  • Total Active Personnel:      ${employees} employees
  • Revenue per Employee:        ${fmtINR(employees > 0 ? Math.round(revenue / employees) : 0)}

INVENTORY STATUS (CURRENT SNAPSHOT):
  • Distinct Inventory Items:    ${inventoryItems} SKUs
  • Total Stock Units:           ${inventoryUnits.toLocaleString()} units

OPERATIONAL THROUGHPUT:
  • Total Transactions Processed: ${txCount.toLocaleString()}
  • Average Order Value:          ${fmtINR(avgOrder)}
  • Operational Cost Base:        ${fmtINR(expenses)}

TOP COST DRIVERS:
${expCats.length > 0 ? expCats.map(c => `  • ${c}`).join("\n") : "  • No expense data available."}
${branchBlock}

OPERATIONS ASSESSMENT:
${profit > 0
  ? `Operations are running efficiently. With ${employees} personnel and ${inventoryItems} inventory SKUs, the network achieved a ${margin}% profit margin.`
  : `Operational costs are exceeding revenue. Focus on inventory optimisation and headcount alignment with sales volumes.`}`;

    } else if (type === 'Marketing') {
      const txPerDay = days > 0 ? (txCount / days).toFixed(1) : 0;
      summaryText = `[AUTOMATED MARKETING ANALYSIS]
Timeline: Last ${days} Days
Scope: ${branchId === 'ALL' ? `Entire Franchise Network (${branchCountStr})` : `Branch ID: ${branchId}`}

SALES PERFORMANCE METRICS:
  • Total Revenue:               ${fmtINR(revenue)}
  • Total Customer Transactions:  ${txCount.toLocaleString()}
  • Average Order Value:          ${fmtINR(avgOrder)}
  • Average Daily Transactions:   ${txPerDay} per day
${branchBlock}

PRODUCT & REVENUE HEALTH:
  • Net Profit Achieved:          ${fmtINR(profit)}
  • Marketing-to-Revenue Margin:  ${margin}%

MARKETING ASSESSMENT:
${txCount > 50
  ? `Customer engagement is strong with ${txCount} transactions at an average of ${fmtINR(avgOrder)} per order. Growth trajectory is positive.`
  : `Transaction volumes are low (${txCount} in ${days} days). Consider targeted promotions to increase footfall and average order size.`}`;
    }

    // ─── Persist Report ───────────────────────────────────────────────────────
    const countRes = await pool.query('SELECT COUNT(*) FROM hq_reports');
    const count = parseInt(countRes.rows[0].count, 10) + 1;
    const year  = new Date().getFullYear();
    const reportId = `REP-${year}-${count.toString().padStart(3, '0')}`;
    const tags = ['automated', `days-${days}`, type.toLowerCase()];

    const insertQ = `
      INSERT INTO hq_reports (report_id, franchise_id, title, type, status, summary, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const newReport = await pool.query(insertQ, [
      reportId, franchiseId, title || `Automated ${type} Report`,
      type, 'Published', summaryText, tags,
    ]);

    res.status(201).json(newReport.rows[0]);

  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ error: "Server error generating report" });
  }
};

module.exports = { getReports, createReport, generateAutomatedReport };
