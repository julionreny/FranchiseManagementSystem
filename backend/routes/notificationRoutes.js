const express = require("express");
const router = express.Router();

const {
  getNotifications,
  clearNotifications,
  deleteNotification,
  getOwnerNotifications
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

/* =========================
   DELETE SINGLE NOTIFICATION
========================= */
router.delete("/:id", deleteNotification);

module.exports = router;