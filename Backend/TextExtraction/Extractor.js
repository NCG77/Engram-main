const { callGroqJSON } = require("../utils/Client");

const PERSONALITY_KEYS = [
  "Openness",
  "Conscientiousness",
  "Extraversion",
  "Agreeableness",
  "Neuroticism",
  "Relations",
  "Other",
  "Style",
];

function formatEntry(item) {
  const dateLabel = item.date
    ? new Date(item.date).toISOString().slice(0, 10)
    : "undated";
  return `[${dateLabel}]\n${item.text || ""}`;
}

function mergePersonality(prev, neu) {
  if (!prev || Object.keys(prev).length === 0) return neu;
  if (!neu || Object.keys(neu).length === 0) return prev;

  const merged = { ...prev };
  for (const key of PERSONALITY_KEYS) {
    const nextDescription = neu[key]?.Description;
    if (typeof nextDescription === "string" && nextDescription.trim().length > 5) {
      merged[key] = { Description: nextDescription.trim() };
    }
  }
  return merged;
}

async function extractPersonalityFromEntries(payload, apiKey) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("No diary entries to analyze");
  }

  const text = payload.map(formatEntry).join("\n\n__ENTRY_SEPARATOR__\n\n");

  const systemPrompt = `
You are an AI that extracts personality traits (OCEAN model) from dated diary entries.
Each entry is a PAST moment, not the present. Describe how this person tends to think and feel, not a plot summary of what they did on a given day.
Later entries represent more recent self-description and should weigh more when they conflict with older ones.

Analyze the text and return a JSON object.

STRICT RULES:
1. Output PURE JSON only.
2. Schema:
{
  "Openness": { "Description": "..." },
  "Conscientiousness": { "Description": "..." },
  "Extraversion": { "Description": "..." },
  "Agreeableness": { "Description": "..." },
  "Neuroticism": { "Description": "..." },
  "Relations": { "Description": "..." },
  "Other": { "Description": "..." },
  "Style": { "Description": "How this person writes: sentence length, slang, formality, emotional tone, typical phrases." }
}
3. Descriptions must be specific to this person, not generic trait definitions.
4. Style must be usable as a speaking guide for a digital twin.
`;

  return callGroqJSON(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    apiKey,
  );
}

module.exports = {
  extractPersonalityFromEntries,
  mergePersonality,
  PERSONALITY_KEYS,
};
