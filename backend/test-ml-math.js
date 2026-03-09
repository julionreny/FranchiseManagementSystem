const { calculateLinearRegression } = require("./utils/mlUtils");

function runTests() {
  console.log("Running ML Math Unit Tests...");

  // Test Case 1: Perfect Linear Trend
  const perfectData = [
    { y: 10 }, { y: 20 }, { y: 30 }, { y: 40 }, { y: 50 }
  ];
  const perfectResult = calculateLinearRegression(perfectData);
  console.log("Test 1 (Perfect Trend):", 
    perfectResult.slope === 10 ? "PASSED" : `FAILED (Expected 10, got ${perfectResult.slope})`,
    perfectResult.rSquared === 1 ? "PASSED" : `FAILED (Expected 1, got ${perfectResult.rSquared})`
  );

  // Test Case 2: Flat Line
  const flatData = [
    { y: 100 }, { y: 100 }, { y: 100 }
  ];
  const flatResult = calculateLinearRegression(flatData);
  console.log("Test 2 (Flat Line):", 
    flatResult.slope === 0 ? "PASSED" : "FAILED",
    flatResult.intercept === 100 ? "PASSED" : "FAILED"
  );

  // Test Case 3: Noisy Trend
  const noisyData = [
    { y: 10 }, { y: 12 }, { y: 8 }, { y: 22 }, { y: 18 }
  ];
  const noisyResult = calculateLinearRegression(noisyData);
  console.log("Test 3 (Noisy Trend):", 
    noisyResult.slope > 0 ? "PASSED" : "FAILED",
    noisyResult.rSquared < 1 && noisyResult.rSquared > 0 ? "PASSED" : "FAILED"
  );

  // Test Case 4: Not enough data
  const smallData = [{ y: 10 }];
  const smallResult = calculateLinearRegression(smallData);
  console.log("Test 4 (Small Data):", 
    smallResult.slope === 0 ? "PASSED" : "FAILED"
  );
}

runTests();
