const express = require("express");
const router = express.Router();

// Import the entire controller safely
const authController = require("../controllers/authController");

/* =========================
   OWNER ROUTES
========================= */
router.post("/owner/send-otp", authController.sendOwnerOtp);
router.post("/owner/register", authController.registerOwner);

/* =========================
   COMMON OTP VERIFY
========================= */
router.post("/verify-otp", authController.verifyOtp);

/* =========================
   MANAGER ROUTES
========================= */
router.post("/manager/send-otp", authController.sendManagerOtp);
router.post("/manager/register", authController.registerManager);

/* =========================
   LOGIN
========================= */
router.post("/login", authController.loginUser);

module.exports = router;
