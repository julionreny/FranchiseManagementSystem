const express = require("express");
const router = express.Router();

const {
  getNotifications,
  clearNotifications,
  deleteNotification,
  getOwnerNotifications,
  clearOwnerNotifications
} = require("../controllers/notificationController");

/* =========================
   OWNER NOTIFICATIONS (ALL BRANCHES)
========================= */
router.get("/owner/:franchiseId", getOwnerNotifications);

/* =========================
   MANAGER NOTIFICATIONS (BRANCH)
========================= */
router.get("/:branchId", getNotifications);

/* =========================
   CLEAR ALL NOTIFICATIONS
========================= */
router.delete("/clear/:branchId", clearNotifications);
router.delete("/branch/:branchId", clearNotifications); // Match Postman
router.delete("/owner/:franchiseId", clearOwnerNotifications); // Match Postman

/* =========================
   DELETE SINGLE NOTIFICATION
========================= */
router.delete("/:id", deleteNotification);

module.exports = router;