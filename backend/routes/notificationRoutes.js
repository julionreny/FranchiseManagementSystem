const express = require("express");
const router = express.Router();

const {
  getNotifications,
  clearNotifications,
} = require("../controllers/notificationController");

/* GET notifications */
router.get("/:branchId", getNotifications);

/* CLEAR ALL notifications */
router.delete("/clear/:branchId", clearNotifications);

module.exports = router;
