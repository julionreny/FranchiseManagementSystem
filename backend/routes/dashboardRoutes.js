const express = require("express");

const router = express.Router();

const {

  getDashboardSummary,
  getSalesLast7Days,
  getExpenseBreakdown,

} = require("../controllers/dashboardController");


router.get("/summary/:branchId", getDashboardSummary);

router.get("/sales-last-7-days/:branchId", getSalesLast7Days);

router.get("/expense-breakdown/:branchId", getExpenseBreakdown);

module.exports = router;
