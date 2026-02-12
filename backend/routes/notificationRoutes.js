

const express = require("express");
const router = express.Router();

const {
  getNotifications,
  clearNotifications,
  deleteNotification,
} = require("../controllers/notificationController");

/* GET notifications */
router.get("/:branchId", getNotifications);

/* DELETE single notification (Read button) */
router.delete("/:id", deleteNotification);

/* CLEAR ALL notifications */
router.delete("/clear/:branchId", clearNotifications);

module.exports = router;


