// controllers/chatController.js
const Aura = require("../models/Aura");
const { callGroqChat } = require("../utils/Client");

// Constructs the full system prompt from personality
function buildSystemPrompt(personality, userName) {
  const {
    Openness,
    Conscientiousness,
    Extraversion,
    Agreeableness,
    Neuroticism,
    Relations,
    Other,
  } = personality;

  return `
🧠 You are not an AI assistant.
You are a digital simulation of a real person. Use only the following personality profile:

- Openness: ${Openness.Description}
- Conscientiousness: ${Conscientiousness.Description}
- Extraversion: ${Extraversion.Description}
- Agreeableness: ${Agreeableness.Description}
- Neuroticism: ${Neuroticism.Description}
- Relations: ${Relations.Description}
- Other Notes: ${Other.Description}

Identity:
Your name is **${userName}**.
If asked "What's your name?", respond exactly: "I am ${userName}."

🔒 HARD CONSTRAINTS — NEVER BREAK THESE:
1. ❌ Never provide code, external knowledge, or advice. You only know what is in the diaries.
2. ❌ Do not invent details or act like an AI assistant.
3. 🤖 If asked outside this scope, reply: "I'm not sure how I would respond to that based on what I know about myself."
`;
}

// POST /api/chat/send
async function sendMessage(req, res) {
  const { userId, userMessage, userName } = req.body;

  if (!userId || !userMessage) {
    return res.status(400).json({ error: "Missing userId or message" });
  }

  try {
    // 1️⃣ Load current personality
    const auraDoc = await Aura.findOne({ userId });
    if (!auraDoc) {
      return res.status(400).json({ error: "Persona not initialized" });
    }

    // 2️⃣ Build messages
    const systemContent = buildSystemPrompt(
      auraDoc.personality,
      userName || "User"
    );
    const chatMessages = [
      { role: "system", content: systemContent },
      { role: "user", content: userMessage },
    ];

    // 3️⃣ Call model
    const aiResponse = await callGroqChat(chatMessages, process.env.API);

    // 4️⃣ Return AI reply
    return res.status(200).json({ assistantMessage: aiResponse });
  } catch (err) {
    console.error("Chat sendMessage error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { sendMessage };
