const db = require("../config/db");
const { createNotification } = require("./notificationController");


/* GET inventory */
exports.getInventory = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        inventory_id,
        product_name,
        quantity,
        reorder_level
      FROM inventory
      WHERE branch_id = $1
      `,
      [branchId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch inventory" });
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

  await createNotification({
  branch_id,
  role_id: 2,
  message: `📦 New Inventory Added: ${product_name}`,
  type: "INVENTORY",
});

};

/* UPDATE quantity (+ / -) */
exports.updateStock = async (req, res) => {
  const { inventoryId } = req.params;
  const { quantity } = req.body;

  if (!inventoryId || quantity === undefined) {
    return res.status(400).json({
      message: "Invalid inventory ID or quantity",
    });
  }

  try {
    const result = await db.query(
      `
      UPDATE inventory
      SET quantity = $1
      WHERE inventory_id = $2
      RETURNING inventory_id, product_name, quantity, reorder_level, branch_id
      `,
      [quantity, inventoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    const item = result.rows[0];

    if (item.quantity <= item.reorder_level) {
      await createNotification({
        branch_id: item.branch_id,
        role_id: 2,
        type: "LOW_STOCK",
        message: `⚠️ Low stock: ${item.product_name} (${item.quantity})`,
      });
    }

    res.json(item);
  } catch (err) {
    console.error("Update stock error:", err);
    res.status(500).json({ message: "Failed to update stock" });
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
