
const express = require("express");
const router = express.Router();
const Accuracy = require("../models/Accuracy");
const authenticateUser = require("../middleware/authmiddleware");
router.get("/", authenticateUser, async (req, res) => {
    const latest = await Accuracy.findOne().sort({ date: -1 });
    res.json(latest || { overallScore: 0, breakdown: {} });
});
module.exports = router;