const express = require("express");

const router = express.Router();

const {
  getOwnerExpenses
} = require("../controllers/ownerExpenseController");


router.get("/:franchiseId", getOwnerExpenses);


module.exports = router;