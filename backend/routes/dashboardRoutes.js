const express = require("express");

const router = express.Router();

const {

  getDashboardSummary,
  getSalesLast7Days,
  getExpenseBreakdown,

} = require("../controllers/dashboardController");


router.get("/summary/:branchId", getDashboardSummary);

router.get("/sales-chart/:branchId", getSalesLast7Days);

router.get("/expense-chart/:branchId", getExpenseBreakdown);


module.exports = router;
