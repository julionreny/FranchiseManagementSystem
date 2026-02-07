const db = require("../config/db");

/* GET inventory */
exports.getInventory = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM inventory WHERE branch_id = $1 ORDER BY inventory_id DESC",
      [branchId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Failed to load inventory" });
  }
};

/* ADD inventory item */
exports.addItem = async (req, res) => {
  const { branch_id, product_name, quantity, reorder_level } = req.body;

  try {
    await db.query(
      `INSERT INTO inventory (branch_id, product_name, quantity, reorder_level)
       VALUES ($1, $2, $3, $4)`,
      [branch_id, product_name, quantity, reorder_level]
    );
    res.json({ message: "Item added" });
  } catch {
    res.status(500).json({ message: "Failed to add item" });
  }
};

/* UPDATE quantity (+ / -) */
exports.updateStock = async (req, res) => {
  const { id, change } = req.body;

  try {
    await db.query(
      `UPDATE inventory
       SET quantity = GREATEST(quantity + $1, 0)
       WHERE inventory_id = $2`,
      [change, id]
    );
    res.json({ message: "Quantity updated" });
  } catch {
    res.status(500).json({ message: "Failed to update quantity" });
  }
};

/* REMOVE inventory item */
exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      "DELETE FROM inventory WHERE inventory_id = $1",
      [id]
    );
    res.json({ message: "Item removed" });
  } catch {
    res.status(500).json({ message: "Failed to remove item" });
  }
};
