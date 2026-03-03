const express = require("express");
const router = express.Router();
const franchiseController = require("../controllers/franchiseController");

router.get("/owner/:ownerId", franchiseController.getOwnerFranchise);

module.exports = router;
