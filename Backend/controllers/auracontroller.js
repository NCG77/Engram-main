const Aura = require("../models/Aura");
const { updateAuraForUser } = require("../services/auraService");

const getAura = async (req, res) => {
  try {
    const aura = await Aura.findOne({ userId: req.userId });
    if (!aura) {
      return res.status(404).json({ error: "No personality found" });
    }
    res.json(aura);
  } catch (err) {
    console.error("getAura error:", err);
    res.status(500).json({ error: "Failed to load personality" });
  }
};

const updateAura = async (req, res) => {
  try {
    const auraDoc = await updateAuraForUser(req.userId);
    if (!auraDoc) {
      return res.status(400).json({ error: "No diary entries to analyze." });
    }
    res.status(200).json(auraDoc);
  } catch (err) {
    console.error("❌ updateAura error:", err);
    res.status(500).json({ error: "Failed to update personality" });
  }
};

module.exports = { getAura, updateAura };
