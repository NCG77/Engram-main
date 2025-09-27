// routes/auraRoute.js
const express = require("express");
const authenticateUser = require("../middleware/authmiddleware");
const { updateAura } = require("../controllers/auracontroller");
const Aura = require("../models/Aura");
const router = express.Router();

// GET existing aura
router.get("/", authenticateUser, async (req, res) => {
  const aura = await Aura.findOne({ userId: req.userId });
  if (!aura) return res.status(404).json({ error: "No personality found" });
  res.json(aura);
});

// POST to re‐compute/update aura from diaries
router.post("/update", authenticateUser, async (req, res) => {
  try {
    await updateAura(req, res);
  } catch (error) {
    console.error("🔥 Error in /update:", error);
    res.status(500).json({ error: "Internal server error woopdi" });
  }
});

module.exports = router;
