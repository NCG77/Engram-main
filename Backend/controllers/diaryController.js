const Diary = require("../models/diary");
const Aura = require("../models/Aura");
const { fork } = require("child_process");
const path = require("path");
const { upsertDiaryToPinecone } = require("../utils/pinecone");

// Fallback personality
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
  console.log(`🔄 [Aura] Triggering update for User: ${userId}`);

  return new Promise(async (resolve, reject) => {
    try {
      const diaries = await Diary.find({ userId }).sort({ createdAt: 1 });

      if (!diaries.length) {
        return resolve(null);
      }

      const payload = diaries.map((d) => ({
        text: d.content,
        date: d.createdAt,
      }));

      // CORRECTED: Pointing to .js file and using Node.js execution
      const extractorPath = path.join(
        __dirname,
        "../TextExtraction/Extractor.js",
      );
      console.log(`🚀 [Aura] Spawning Node Extractor: ${extractorPath}`);

      // Use fork() for Node.js scripts
      const extractorProcess = fork(extractorPath, [], {
        env: { ...process.env },
      });

      let resultData = null;

      // Send data via IPC
      extractorProcess.send({ payload });

      extractorProcess.on("message", (message) => {
        if (message.result) {
          console.log("✨ [Aura] AI Extraction Successful.");
          resultData = message.result;
        } else if (message.error) {
          console.error("❌ [Aura] Extractor reported error:", message.error);
        }
      });

      extractorProcess.on("close", async (code) => {
        let finalPersonality = resultData;

        if (code !== 0 || !finalPersonality) {
          console.error(
            `⚠️ [Aura] Extractor failed (Code ${code}). USING FALLBACK.`,
          );
          finalPersonality = FALLBACK_PERSONALITY;
        }

        try {
          const auraDoc = await Aura.findOneAndUpdate(
            { userId },
            { personality: finalPersonality },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );
          console.log(`✅ [Aura] Database updated successfully!`);
          resolve(auraDoc);
        } catch (err) {
          console.error("❌ [Aura] Database save failed:", err);
          resolve(null);
        }
      });
    } catch (err) {
      console.error("❌ [Aura] Controller Error:", err);
      resolve(null);
    }
  });
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
    console.log(`📔 [Diary] Entry saved: "${title}"`);

    // Upsert to Pinecone vector DB for RAG
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

module.exports = {
  createDiaryEntry,
  getDiaryEntries,
  triggerAuraUpdate,
};
