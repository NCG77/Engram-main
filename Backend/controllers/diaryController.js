// controllers/diaryController.js
const Diary = require("../models/diary");
const Aura = require("../models/Aura");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Helper that pulls all diaries, runs extractor.py, upserts Aura.
 * Returns a Promise that resolves to the updated Aura doc, or rejects on error.
 */
async function updateUserAura(userId) {
  // 1️⃣ Fetch all diaries
  const diaries = await Diary.find({ userId }).sort({ createdAt: 1 });
  if (!diaries.length) throw new Error("No diaries to analyze");

  const payload = diaries.map((d) => ({ text: d.content }));

  // 2️⃣ Write temp JSON file
  const tempDir = path.join(__dirname, "../database");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const tempFile = path.join(tempDir, `diary_${userId}.json`);
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2));

  // 3️⃣ Spawn the Python extractor
  return new Promise((resolve, reject) => {
    const extractor = spawn("python3", [
      path.join(__dirname, "../../extractor.py"),
      tempFile,
    ]);

    let stdout = "";
    let stderr = "";

    extractor.stdout.on("data", (data) => (stdout += data.toString()));
    extractor.stderr.on("data", (data) => (stderr += data.toString()));

    extractor.on("close", async (code) => {
      if (code !== 0) {
        return reject(new Error(`Extractor exited ${code}: ${stderr}`));
      }
      let personality;
      try {
        personality = JSON.parse(stdout);
      } catch (e) {
        return reject(new Error("Invalid JSON from extractor: " + e.message));
      }

      try {
        const auraDoc = await Aura.findOneAndUpdate(
          { userId },
          { personality },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        resolve(auraDoc);
      } catch (mongoErr) {
        reject(mongoErr);
      }
    });
  });
}

const createDiaryEntry = async (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let savedEntry;
  try {
    savedEntry = await new Diary({ title, content, userId }).save();
  } catch (err) {
    console.error("Error saving diary entry:", err);
    return res.status(500).json({ error: "Failed to create diary entry" });
  }

  // 🔥 Fire-and-forget the aura update so it can't block the response
  updateUserAura(userId)
    .then((aura) => {
      console.log("Aura successfully updated:", aura._id);
    })
    .catch((err) => {
      console.error("Failed to update aura (but diary was saved):", err);
    });

  // ✅ Respond immediately with the saved diary
  res.status(201).json({ diaryEntry: savedEntry });
};

const getDiaryEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await Diary.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    res.status(500).json({ error: "Failed to fetch diary entries" });
  }
};

module.exports = {
  createDiaryEntry,
  getDiaryEntries,
};
