const express = require("express");
const router = express.Router();

const {
  getInventory,
  addItem,
  updateStock,
  deleteItem,
} = require("../controllers/inventoryController");


router.get("/:branchId", getInventory);

router.post("/add", addItem);

router.put("/update-quantity/:inventoryId", updateStock);

/* THIS IS THE IMPORTANT ONE */
router.delete("/:id", deleteItem);


module.exports = router;
