/**
 * ml/forecasting.cjs
 * ─────────────────────────────────────────────────────────────────────────
 * Pure-JS Machine Learning utilities for the Franchise Management System.
 * All computation is done in-process — no external Python server required.
 */

const applyEWMASmooth = (data, alpha = 0.3) => {
  if (!data || data.length === 0) return [];
  let prev = data[0].y;
  return data.map(point => {
    const smoothedY = alpha * point.y + (1 - alpha) * prev;
    prev = smoothedY;
    return { ...point, y: smoothedY };
  });
};

const calculateWeightedLinearRegression = (data, decayFactor = 0.97) => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.y || 0, rSquared: 0 };

  const weights = data.map((_, i) => Math.pow(decayFactor, n - 1 - i));
  const W = weights.reduce((a, b) => a + b, 0);

  let wSX = 0, wSY = 0, wSXY = 0, wSXX = 0;
  data.forEach((pt, i) => {
    const w = weights[i];
    wSX  += w * i;
    wSY  += w * pt.y;
    wSXY += w * i * pt.y;
    wSXX += w * i * i;
  });

  const denom = W * wSXX - wSX * wSX;
  const slope     = denom !== 0 ? (W * wSXY - wSX * wSY) / denom : 0;
  const intercept = (wSY - slope * wSX) / W;

  const yMean = wSY / W;
  let ssRes = 0, ssTot = 0;
  data.forEach((pt, i) => {
    ssRes += Math.pow(pt.y - (slope * i + intercept), 2);
    ssTot += Math.pow(pt.y - yMean, 2);
  });
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, rSquared };
};

const buildForecast = (rows, forecastDays = 30) => {
  const rawData = rows.map((row, index) => ({
    x: index,
    y: Number(row.daily_revenue),
    date: row.date,
  }));

  const smoothed = applyEWMASmooth(rawData, 0.3);
  const { slope, intercept, rSquared } = calculateWeightedLinearRegression(smoothed, 0.97);

  const historicalPoints = rawData.map(p => ({
    date: new Date(p.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    revenue: Math.round(p.y),
  }));

  const lastIndex = rawData.length - 1;
  let predictedTotal = 0;
  const forecastPoints = [];

  for (let i = 1; i <= forecastDays; i++) {
    const prediction = Math.max(0, slope * (lastIndex + i) + intercept);
    predictedTotal += prediction;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    forecastPoints.push({
      date: futureDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      forecast: Math.round(prediction),
    });
  }

  const avg = arr => arr.reduce((s, p) => s + p.y, 0) / (arr.length || 1);
  const firstWeekAvg = avg(rawData.slice(0, 7));
  const lastWeekAvg  = avg(rawData.slice(-7));
  const trendPct     = firstWeekAvg > 0
    ? Number((((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100).toFixed(1))
    : 0;
  const trend = trendPct > 3 ? "GROWING" : trendPct < -3 ? "DECLINING" : "STABLE";

  return {
    historicalPoints,
    forecastPoints,
    predictedTotal30Days: Math.round(predictedTotal),
    confidenceScore: Math.round(rSquared * 100),
    slope: Number(slope.toFixed(2)),
    weeklyAvg: Math.round(lastWeekAvg),
    trend,
    trendPct,
  };
};

module.exports = { applyEWMASmooth, calculateWeightedLinearRegression, buildForecast };
