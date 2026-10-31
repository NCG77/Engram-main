const { Queue, Worker } = require("bullmq");
const https = require("https");
const Diary = require("../models/diary");
const Aura = require("../models/Aura");

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

const auraQueue = new Queue("auraUpdateQueue", { connection });

async function extractAura(payload) {
  const apiKey = process.env.API || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("API key not found");

  const text = payload.map((item) => item.text).join("\n\n__ENTRY_SEPARATOR__\n\n");
  const systemPrompt = `You are an AI that extracts personality traits (OCEAN model) from diary entries.
    Analyze the text below and return a JSON object.
    STRICT RULES:
    1. Output PURE JSON only. No markdown, no code blocks, no intro text.
    2. Schema:
    {
      "Openness": { "Description": "..." },
      "Conscientiousness": { "Description": "..." },
      "Extraversion": { "Description": "..." },
      "Agreeableness": { "Description": "..." },
      "Neuroticism": { "Description": "..." },
      "Relations": { "Description": "..." },
      "Other": { "Description": "..." }
    }`;

  const requestData = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.6,
    response_format: { type: "json_object" },
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Groq API Error: ${res.statusCode} - ${data}`));
        }
        try {
          const jsonResponse = JSON.parse(data);
          const content = jsonResponse.choices?.[0]?.message?.content;
          if (!content) return reject(new Error("No content in response"));
          const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
          resolve(JSON.parse(cleanContent));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.write(JSON.stringify(requestData));
    req.end();
  });
}

const worker = new Worker("auraUpdateQueue", async (job) => {
  const { userId } = job.data;
  console.log(`[Aura Worker] Processing job for user ${userId}`);
  
  const diaries = await Diary.find({ userId }).sort({ createdAt: 1 });
  if (!diaries.length) return;

  const payload = diaries.map((d) => ({
    text: d.content,
    date: d.createdAt,
  }));

  try {
    const finalPersonality = await extractAura(payload);
    await Aura.findOneAndUpdate(
      { userId },
      { personality: finalPersonality },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Aura Worker] Successfully updated Aura for user ${userId}`);
  } catch (error) {
    console.error(`[Aura Worker] Error processing user ${userId}:`, error);
    throw error;
  }
}, { connection, concurrency: 5 });

worker.on("failed", (job, err) => {
  console.error(`[Aura Worker] Job ${job?.id} failed with error ${err.message}`);
});

module.exports = { auraQueue };
