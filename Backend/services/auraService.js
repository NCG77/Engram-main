const Diary = require("../models/diary");
const Aura = require("../models/Aura");
const {
  extractPersonalityFromEntries,
  mergePersonality,
} = require("../TextExtraction/Extractor");

const FALLBACK_PERSONALITY = {
  Openness: { Description: "Curious and open to new experiences." },
  Conscientiousness: { Description: "Thoughtful and organized." },
  Extraversion: { Description: "Balanced energy levels." },
  Agreeableness: { Description: "Friendly and cooperative." },
  Neuroticism: { Description: "Generally calm and stable." },
  Relations: { Description: "Values personal connections." },
  Other: { Description: "Generated via fallback system." },
  Style: { Description: "Speaks in short, personal first-person sentences." },
};

const inFlight = new Map();

async function updateAuraForUser(userId) {
  const key = String(userId);
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const job = (async () => {
    const diaries = await Diary.find({ userId }).sort({ createdAt: 1 });
    if (!diaries.length) {
      return null;
    }

    const payload = diaries.map((entry) => ({
      text: entry.content,
      date: entry.createdAt,
    }));

    const previous = await Aura.findOne({ userId });
    const apiKey = process.env.API || process.env.GROQ_API_KEY;

    let extracted;
    try {
      extracted = await extractPersonalityFromEntries(payload, apiKey);
    } catch (err) {
      console.error("❌ [Aura] Extraction failed:", err.message);
      if (previous) {
        return previous;
      }
      extracted = FALLBACK_PERSONALITY;
    }

    const personality =
      mergePersonality(previous?.personality, extracted) ||
      extracted ||
      FALLBACK_PERSONALITY;

    return Aura.findOneAndUpdate(
      { userId },
      { personality },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  })().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, job);
  return job;
}

module.exports = {
  updateAuraForUser,
  FALLBACK_PERSONALITY,
};
