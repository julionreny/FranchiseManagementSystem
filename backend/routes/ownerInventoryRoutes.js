const express = require("express");
const router = express.Router();

const {
  getOwnerInventory,
} = require("../controllers/ownerInventoryController");

router.get("/:franchiseId", getOwnerInventory);

module.exports = router;
