const db = require("../config/db");

/*
GET all inventory for franchise owner
Shows inventory from ALL branches of that franchise
Includes branch location
*/

exports.getOwnerInventory = async (req, res) => {
  const { franchiseId } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        i.inventory_id,
        i.product_name,
        i.quantity,
        i.unit,
        i.reorder_level,
        b.branch_id,
        b.location AS branch_location

      FROM inventory i

      JOIN branches b
      ON i.branch_id = b.branch_id

      WHERE b.franchise_id = $1

      ORDER BY i.inventory_id DESC
      `,
      [franchiseId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Owner inventory error:", err);
    res.status(500).json({
      message: "Failed to fetch franchise inventory",
    });
  }
};
