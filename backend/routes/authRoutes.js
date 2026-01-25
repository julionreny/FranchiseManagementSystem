const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/owner/send-otp", authController.sendOwnerOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/owner/register", authController.registerOwner);
router.post("/manager/register", authController.registerManager);

router.post("/login", authController.loginUser);

module.exports = router;
