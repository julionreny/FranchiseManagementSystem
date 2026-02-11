const db = require("../config/db");

/* =========================
   GET NOTIFICATIONS (BRANCH)
========================= */
exports.getNotifications = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await db.query(
      `
      SELECT notification_id, message, type, created_at
      FROM notifications
      WHERE branch_id = $1
      ORDER BY created_at DESC
      `,
      [branchId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/* =========================
   CREATE NOTIFICATION (HELPER)
========================= */
exports.createNotification = async ({
  branch_id,
  role_id,
  message,
  type,
}) => {
  await db.query(
    `
    INSERT INTO notifications
    (branch_id, role_id, message, type)
    VALUES ($1,$2,$3,$4)
    `,
    [branch_id, role_id, message, type]
  );
};
exports.clearNotifications = async (req, res) => {
  const { branchId } = req.params;

  try {
    await db.query(
      `
      DELETE FROM notifications
      WHERE branch_id = $1
      `,
      [branchId]
    );

    res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};
