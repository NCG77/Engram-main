const Diary = require("../models/diary");
const Aura = require("../models/Aura");
const { auraQueue } = require("../queues/auraQueue");
const { upsertDiaryToPinecone, deleteDiaryFromPinecone } = require("../utils/pinecone");
const FALLBACK_PERSONALITY = {
  Openness: { Description: "Curious and open to new experiences." },
  Conscientiousness: { Description: "Thoughtful and organized." },
  Extraversion: { Description: "Balanced energy levels." },
  Agreeableness: { Description: "Friendly and cooperative." },
  Neuroticism: { Description: "Generally calm and stable." },
  Relations: { Description: "Values personal connections." },
  Other: { Description: "Generated via fallback system." },
};
const triggerAuraUpdate = (userId) => {
  return auraQueue.add(
    "updateAura",
    { userId },
    {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    }
  );
};
const createDiaryEntry = async (req, res) => {
  const userId = req.userId || req.body.userId;
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  try {
    const newEntry = new Diary({ userId, title, content });
    const savedEntry = await newEntry.save();
    upsertDiaryToPinecone(savedEntry).catch(console.error);
    triggerAuraUpdate(userId);
    res.status(201).json({ diaryEntry: savedEntry });
  } catch (err) {
    console.error("Error saving diary:", err);
    res.status(500).json({ error: "Failed to save entry" });
  }
};
const getDiaryEntries = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const entries = await Diary.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching diaries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};
const deleteDiaryEntry = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  try {
    const deletedEntry = await Diary.findOneAndDelete({ _id: id, userId });
    if (!deletedEntry) {
      return res.status(404).json({ error: "Diary entry not found or unauthorized" });
    }
    deleteDiaryFromPinecone(id).catch(console.error);
    triggerAuraUpdate(userId);
    res.status(200).json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting diary:", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
};
module.exports = {
  createDiaryEntry,
  getDiaryEntries,
  deleteDiaryEntry,
  triggerAuraUpdate,
};
