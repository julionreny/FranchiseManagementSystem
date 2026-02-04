const pool = require("../config/db");

exports.getOwnerFranchise = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM franchises WHERE owner_id = $1",
      [ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No franchise found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("FETCH FRANCHISE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch franchise" });
  }
};
