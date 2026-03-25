const express = require("express");
const router = express.Router();

const {
  getDashboardSummary,
  getSalesLast7Days,
  getExpenseBreakdown,
  getOwnerDashboardStats,
  getOwnerBranchTrend,
  getOwnerBranchPerformance,
} = require("../controllers/dashboardController");

const { getSalesForecast } = require("../controllers/mlController");

/* =========================
   MANAGER ROUTES (Branch Level)
========================= */

router.get("/branch/:branchId", getDashboardSummary); // Match Postman
router.get("/summary/:branchId", getDashboardSummary);
router.get("/sales-last-7-days/:branchId", getSalesLast7Days);
router.get("/expense-breakdown/:branchId", getExpenseBreakdown);
router.get("/branch/:branchId/performance", getOwnerBranchPerformance); // Match Postman

/* =========================
   OWNER ROUTES (Franchise Level)
========================= */

router.get("/owner/:franchiseId", getOwnerDashboardStats); // Match Postman
router.get("/owner-stats/:franchiseId", getOwnerDashboardStats);
router.get("/franchise/:franchiseId/overview", getOwnerDashboardStats); // Match Postman
router.get("/owner-branch-trend/:franchiseId", getOwnerBranchTrend);
router.get("/owner-branch-performance/:franchiseId", getOwnerBranchPerformance);

/* =========================
   ML FORECAST
======================== */

router.get("/forecast/:franchiseId", getSalesForecast);

module.exports = router;