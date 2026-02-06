const express = require("express");
const router = express.Router();
const {
  getEmployees,
  addEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

router.get("/:branchId", getEmployees);
router.post("/add", addEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
