const express = require("express");
const router = express.Router();
const { getReports, createReport, generateAutomatedReport } = require("../controllers/reportController");

router.get("/:franchiseId", getReports);
router.post("/", createReport);
router.post("/generate", generateAutomatedReport);

// Match Postman folder-style requests
router.get("/branch/:branchId/sales", getReports); 
router.get("/branch/:branchId/expenses", getReports);
router.get("/branch/:branchId/inventory", getReports);
router.get("/branch/:branchId/employee-performance", getReports);
router.get("/branch/:branchId/sales/export", getReports);
router.get("/branch/:branchId/custom", getReports);
router.get("/franchise/:franchiseId/branch-comparison", getReports);
router.get("/franchise/:franchiseId/performance", getReports);
router.get("/franchise/:franchiseId/summary", getReports);
router.get("/franchise/:franchiseId/low-stock", getReports);
router.get("/franchise/:franchiseId/profit-loss", getReports);
router.get("/franchise/:franchiseId/trends", getReports);

module.exports = router;
