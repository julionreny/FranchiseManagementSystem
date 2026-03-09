const express = require("express");
const router = express.Router();
const { getBranches, createBranch, updateBranch, deleteBranch, resetInviteCode } = require("../controllers/branchController");

router.get("/franchise/:franchiseId", getBranches);
router.post("/create", createBranch);
router.put("/update/:branchId", updateBranch);
router.delete("/delete/:branchId", deleteBranch);
router.post("/reset-invite/:branchId", resetInviteCode);

module.exports = router;
