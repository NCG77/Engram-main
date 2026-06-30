require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");
function checkApi() {
  const apiKey =
    process.env.API || process.env.VITE_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ [Extractor] API key not found in environment variables.");
    process.exit(1);
  }
  return apiKey;
}
async function loadEntries() {
  return new Promise((resolve) => {
    process.on("message", (message) => {
      if (message && message.payload) {
        resolve(message.payload);
      } else {
        console.error("❌ [Extractor] Received message but no payload.");
        process.exit(1);
      }
    });
    setTimeout(() => {
      if (process.argv.length > 2) {
        try {
          const raw = fs.readFileSync(process.argv[2], "utf8");
          const data = JSON.parse(raw);
          resolve(data.map((d) => ({ text: d.text || "" })));
        } catch (e) {
          process.exit(1);
        }
      } else {
        // If we are here, it likely means the controller spawned us but didn't send data fast enough,
        // or we are running standalone without args.
        // We don't exit immediately to give IPC a tiny bit more chance, but usually we fail here.
        console.error("⚠️ [Extractor] No input received. Waiting...");
      }
    }, 2000);
  });
}
// 3. Call Groq API
async function extract(apiKey, payload) {
  const text = payload
    .map((item) => item.text)
    .join("\n\n__ENTRY_SEPARATOR__\n\n");
  const systemPrompt = `
    You are an AI that extracts personality traits (OCEAN model) from diary entries.
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
    }
  `;
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
          return reject(
            new Error(`Groq API Error: ${res.statusCode} - ${data}`),
          );
        }
        try {
          const jsonResponse = JSON.parse(data);
          const content = jsonResponse.choices?.[0]?.message?.content;
          if (!content) return reject(new Error("No content in response"));
          const cleanContent = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
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
function mergeData(prev, neu) {
  if (!prev || Object.keys(prev).length === 0) return neu;
  const merged = { ...prev };
  for (const key of [
    "Openness",
    "Conscientiousness",
    "Extraversion",
    "Agreeableness",
    "Neuroticism",
    "Relations",
    "Other",
  ]) {
    if (neu[key] && neu[key].Description && neu[key].Description.length > 5) {
      merged[key] = neu[key];
    }
  }
  return merged;
}
(async () => {
  try {
    const apiKey = checkApi();
    const payload = await loadEntries();
    const neu = await extract(apiKey, payload);
    if (process.send) {
      process.send({ result: neu });
    } else {
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ [Extractor] Critical Error:", err.message);
    if (process.send) process.send({ error: err.message });
    process.exit(1);
  }
})();
