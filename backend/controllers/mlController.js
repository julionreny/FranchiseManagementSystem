const db = require("../config/db");
const { buildForecast } = require("../../ml/forecasting.cjs");

/**
 * GET /api/dashboard/forecast/:franchiseId
 * Uses weighted linear regression + EWMA smoothing from ml/forecasting.js
 * to forecast the next 30 days of network revenue.
 */
exports.getSalesForecast = async (req, res) => {
  const { franchiseId } = req.params;

  try {
    // Aggregate daily revenue across ALL branches in the franchise for last 90 days.
    // generate_series ensures every day appears (gaps filled with 0).
    const result = await db.query(
      `SELECT
         d.date::date AS date,
         COALESCE(SUM(s.amount), 0) AS daily_revenue
       FROM generate_series(
              CURRENT_DATE - INTERVAL '89 days',
              CURRENT_DATE,
              '1 day'
            ) AS d(date)
       LEFT JOIN (
         SELECT s.amount, s.sale_date
         FROM sales s
         JOIN branches b ON s.branch_id = b.branch_id
         WHERE b.franchise_id = $1
       ) s ON DATE(s.sale_date) = d.date
       GROUP BY d.date
       ORDER BY d.date`,
      [franchiseId]
    );

    if (result.rows.length === 0) {
      return res.json({
        historicalPoints: [],
        forecastPoints: [],
        predictedTotal30Days: 0,
        confidenceScore: 0,
        slope: 0,
        weeklyAvg: 0,
        trend: "STABLE",
        trendPct: 0,
      });
    }

    // Delegate all ML computation to ml/forecasting.js
    const payload = buildForecast(result.rows, 30);
    res.json(payload);

  } catch (err) {
    console.error("Forecasting Error:", err);
    res.status(500).json({ message: "Failed to generate sales forecast" });
  }
};
