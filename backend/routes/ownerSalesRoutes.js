const express = require("express");
const router = express.Router();

const {
  getOwnerSales,
} = require("../controllers/ownerSalesController");

router.get("/:franchiseId", getOwnerSales);

module.exports = router;
