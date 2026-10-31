const express = require("express");
const router = express.Router();
const Accuracy = require("../models/Accuracy");
const authenticateUser = require("../middleware/authmiddleware");

router.get("/", authenticateUser, async (req, res) => {
  try {
    const latest = await Accuracy.findOne({ userId: req.userId }).sort({
      date: -1,
    });
    res.json(
      latest || {
        overallScore: 0,
        breakdown: {},
        sampleCounts: { reviews: 0, turns: 0 },
        method: "composite-v1",
      },
    );
  } catch (err) {
    console.error("Accuracy fetch error:", err);
    res.status(500).json({ error: "Failed to load accuracy" });
  }
});

module.exports = router;
