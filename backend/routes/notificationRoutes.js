


const express = require("express");
const router = express.Router();

const {
  getNotifications,
  clearNotifications,
  deleteNotification,
  getNotificationsByFranchise,
} = require("../controllers/notificationController");

/* GET notifications by franchise (Owner) */
router.get("/franchise/:franchiseId", getNotificationsByFranchise);

/* GET notifications by branch (Manager) — legacy */
router.get("/:branchId", getNotifications);

/* DELETE single notification */
router.delete("/clear/:branchId", clearNotifications);

/* CLEAR ALL */
router.delete("/:id", deleteNotification);

module.exports = router;



