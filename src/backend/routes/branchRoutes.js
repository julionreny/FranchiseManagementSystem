const express = require("express");
const router = express.Router();
const { getBranches, createBranch } = require("../controllers/branchController");

router.get("/franchise/:franchiseId", getBranches);
router.post("/create", createBranch);

module.exports = router;
