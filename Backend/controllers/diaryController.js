const Diary = require("../models/diary");
const { updateAuraForUser } = require("../services/auraService");

const createDiaryEntry = async (req, res) => {
  const userId = req.userId;
  const title = String(req.body.title || "").trim() || "Untitled";
  const content = String(req.body.content || "").trim();

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const savedEntry = await Diary.create({ userId, title, content });
    console.log(`📔 [Diary] Entry saved: "${title}"`);

    updateAuraForUser(userId).catch((err) => {
      console.error("❌ [Aura] Background update failed:", err.message);
    });

    res.status(201).json({ diaryEntry: savedEntry });
  } catch (err) {
    console.error("Error saving diary:", err);
    res.status(500).json({ error: "Failed to save entry" });
  }
};

const getDiaryEntries = async (req, res) => {
  try {
    const entries = await Diary.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching diaries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};

module.exports = {
  createDiaryEntry,
  getDiaryEntries,
};
