const db = require("../config/db");
const { calculateLinearRegression } = require("../utils/mlUtils");

exports.getSalesForecast = async (req, res) => {
  const { franchiseId } = req.params;
  try {
    // Fetch daily sales for the last 60 days to establish a trend
    const result = await db.query(
      `SELECT
         d.date::date as date,
         COALESCE(SUM(s.amount), 0) AS daily_revenue
       FROM generate_series(CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE, '1 day') AS d(date)
       CROSS JOIN branches b
       LEFT JOIN sales s ON s.branch_id = b.branch_id AND DATE(s.sale_date) = d.date
       WHERE b.franchise_id = $1
       GROUP BY d.date
       ORDER BY d.date`,
      [franchiseId]
    );

    const historicalData = result.rows.map((row, index) => ({
      x: index,
      y: Number(row.daily_revenue),
      date: row.date
    }));

    const { slope, intercept, rSquared } = calculateLinearRegression(historicalData);

    // Predict next 30 days
    const lastIndex = historicalData.length - 1;
    let predictedTotal30Days = 0;
    const forecastPoints = [];

    for (let i = 1; i <= 30; i++) {
      const nextX = lastIndex + i;
      const prediction = Math.max(0, slope * nextX + intercept);
      predictedTotal30Days += prediction;
      
      // We'll return some forecast points for the chart
      if (i % 5 === 0 || i === 1 || i === 30) {
        forecastPoints.push({
          day: i,
          prediction: Math.round(prediction)
        });
      }
    }

    res.json({
      predictedTotal30Days: Math.round(predictedTotal30Days),
      confidenceScore: Math.round(rSquared * 100),
      slope: Number(slope.toFixed(2)),
      forecastPoints,
      historicalAvg: historicalData.reduce((a, b) => a + b.y, 0) / historicalData.length
    });

  } catch (err) {
    console.error("Forecasting Error:", err);
    res.status(500).json({ message: "Failed to generate sales forecast" });
  }
};
