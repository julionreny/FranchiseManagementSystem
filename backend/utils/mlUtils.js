/**
 * Calculates a linear regression trend for a given set of data points (x, y).
 * returns { slope, intercept, rSquared }
 */
const calculateLinearRegression = (data) => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.y || 0, rSquared: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  data.forEach((point, i) => {
    const x = i; // Use index as time variable
    const y = point.y;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared (Coefficient of Determination)
  const xMean = sumX / n;
  const yMean = sumY / n;
  let ssRes = 0; // sum of squares of residuals
  let ssTot = 0; // total sum of squares
  data.forEach((point, i) => {
    const x = i;
    const y = point.y;
    const yPred = slope * x + intercept;
    ssRes += Math.pow(y - yPred, 2);
    ssTot += Math.pow(y - yMean, 2);
  });

  const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

  return { slope, intercept, rSquared };
};

module.exports = {
  calculateLinearRegression
};
