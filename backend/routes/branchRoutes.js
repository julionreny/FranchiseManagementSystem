const express = require("express");
const router = express.Router();
const { createBranch } = require("../controllers/branchController");

router.post("/create", createBranch);

module.exports = router;
