const express = require("express");
const router = express.Router();

const {
  getInventory,
  addItem,
  updateStock,
  deleteItem,
} = require("../controllers/inventoryController");

/* GET INVENTORY */
router.get("/:branchId", getInventory);

/* ADD ITEM */
router.post("/add", addItem);

/* ✅ UPDATE QUANTITY (THIS WAS MISSING / MISMATCHED) */
router.put("/update-quantity/:inventoryId", updateStock);

/* DELETE ITEM */
router.delete("/:inventoryId", deleteItem);

module.exports = router;
