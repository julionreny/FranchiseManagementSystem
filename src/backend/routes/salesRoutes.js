const express = require("express");
const router = express.Router();
const {
  getSalesByBranch,
  addSale
} = require("../controllers/salesController");

router.get("/:branchId", getSalesByBranch);
router.post("/", addSale);

module.exports = router;
