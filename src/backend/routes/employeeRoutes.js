const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployeesByFranchise,
  addEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

router.get("/franchise/:franchiseId", getEmployeesByFranchise);
router.get("/:branchId", getEmployees);
router.post("/add", addEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
