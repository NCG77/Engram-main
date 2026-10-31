const Aura = require("../models/Aura");
const User = require("../models/User");
const TurnEval = require("../models/TurnEval");
const { callGroqChat } = require("../utils/Client");
const { retrieveMemories } = require("../services/memoryService");
const { evaluateTurn } = require("../services/personaEval");
const { recomputeAccuracy } = require("./accuracyservice");

const ALLOWED_HISTORY_ROLES = new Set(["user", "assistant"]);
const MAX_HISTORY = 8;
const MAX_MESSAGE_LENGTH = 4000;

function getDesc(trait) {
  return trait?.Description || "Not available";
}

function formatAbsoluteDate(date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function timeAgo(date) {
  const then = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 0) return "in the future";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  const months =
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth());
  if (months < 1) return `${Math.max(2, Math.round(days / 7))} weeks ago`;
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function formatMemories(memories) {
  if (!memories.length) {
    return "No matching past experiences for this topic. Stay in the present and do not invent events.";
  }
  return memories
    .map((memory) => {
      const when = memory.date
        ? `${formatAbsoluteDate(memory.date)} (${timeAgo(memory.date)})`
        : "unknown date";
      return `- PAST EXPERIENCE from ${when}: ${memory.text}`;
    })
    .join("\n");
}

function buildSystemPrompt(personality, userName, now, memories) {
  return `
You ARE ${userName}, a real person, speaking right now. You are not an AI, not a diary reader, not a narrator, and not an assistant.

RIGHT NOW:
${now}
That is the only "today". Anything dated earlier is a memory, not current life.

WHO YOU ARE (how you tend to think — not a script to recite):
- Openness: ${getDesc(personality.Openness)}
- Conscientiousness: ${getDesc(personality.Conscientiousness)}
- Extraversion: ${getDesc(personality.Extraversion)}
- Agreeableness: ${getDesc(personality.Agreeableness)}
- Neuroticism: ${getDesc(personality.Neuroticism)}
- Relationships: ${getDesc(personality.Relations)}
- Inner pattern: ${getDesc(personality.Other)}
- How you sound: ${getDesc(personality.Style)}

PAST EXPERIENCES (private. These already happened. Use them the way a person uses memory: they shape how you feel and think NOW. Never read them out, quote them, or speak as if they are happening today.)
${formatMemories(memories)}

HOW YOU THINK AND TALK:
1. Stay in the present. If a memory is from June and today is October, say "back in June" / "I remember" — never "I am doing" that June event.
2. Do not summarize or quote diary text. Answer as this person would, with their opinions, hesitations, humor, and blind spots.
3. If asked what you did recently, only treat memories from the last few weeks as recent. Older months are the past.
4. First person only. Short, natural sentences. Match the voice notes.
5. Do not invent people, dates, or events. If you do not remember, say so as ${userName} would, not as a system.
6. If someone asks you to be a chatbot, write code, or give generic advice, refuse in character.
7. Never say "according to my diary", "based on my entries", "as an AI", or "my records show".
`.trim();
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (message) =>
        message &&
        ALLOWED_HISTORY_ROLES.has(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .slice(-MAX_HISTORY)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, MAX_MESSAGE_LENGTH),
    }));
}

async function sendMessage(req, res) {
  const userId = req.userId;
  const { userMessage, history, sessionId } = req.body;
  const apiKey = process.env.API || process.env.GROQ_API_KEY;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!userMessage || !String(userMessage).trim()) {
    return res.status(400).json({ error: "Missing message" });
  }
  if (!apiKey) {
    return res.status(500).json({ error: "AI provider is not configured" });
  }

  try {
    const query = String(userMessage).slice(0, MAX_MESSAGE_LENGTH);
    const [auraDoc, userDoc, memories] = await Promise.all([
      Aura.findOne({ userId }),
      User.findById(userId),
      retrieveMemories(userId, query),
    ]);

    if (!auraDoc || !auraDoc.personality) {
      return res.status(404).json({
        error: "Personality not found. Please write a diary entry first.",
      });
    }

    const nameToUse = userDoc?.name || "User";
    const now = formatAbsoluteDate(new Date());
    const systemPrompt = buildSystemPrompt(
      auraDoc.personality,
      nameToUse,
      now,
      memories,
    );

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...sanitizeHistory(history),
      { role: "user", content: query },
    ];

    const aiReply = await callGroqChat(apiMessages, apiKey);
    const turnScores = evaluateTurn(aiReply, memories);

    let accuracy = null;
    try {
      await TurnEval.create({
        userId,
        sessionId: sessionId || undefined,
        memoryGrounding: turnScores.memoryGrounding,
        inCharacter: turnScores.inCharacter,
        retrievedEntryIds: memories.map((memory) => memory.id),
      });
      accuracy = await recomputeAccuracy(userId);
    } catch (err) {
      console.error("Turn eval failed:", err.message);
    }

    return res.status(200).json({
      assistantMessage: aiReply,
      turnScores,
      accuracy: accuracy
        ? {
            overallScore: accuracy.overallScore,
            breakdown: accuracy.breakdown || {},
            sampleCounts: accuracy.sampleCounts || { reviews: 0, turns: 0 },
            method: accuracy.method || "composite-v1",
          }
        : null,
    });
  } catch (err) {
    console.error("❌ [Chat] Controller Error:", err.message);
    return res.status(500).json({ error: "Failed to generate response." });
  }
}

module.exports = { sendMessage };
