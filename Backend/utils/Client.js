const https = require("https");

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const REQUEST_TIMEOUT_MS = 60000;

function stripCodeFences(text) {
  return String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function groqRequest(messages, apiKey, extra = {}) {
  return new Promise((resolve, reject) => {
    if (!apiKey) {
      return reject(new Error("API key is missing"));
    }

    const payload = JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: extra.temperature ?? 0.7,
      max_tokens: extra.max_tokens ?? 1024,
      ...(extra.response_format ? { response_format: extra.response_format } : {}),
    });

    const req = https.request(
      {
        hostname: "api.groq.com",
        path: "/openai/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(
              new Error(`Groq API error ${res.statusCode}: ${data}`),
            );
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.message?.content;
            if (!content) {
              return reject(new Error("Groq response had no message content"));
            }
            resolve(content.trim());
          } catch (err) {
            reject(new Error("Failed to parse Groq response: " + err.message));
          }
        });
      },
    );

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error("Groq request timed out"));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function callGroqJSON(messages, apiKey) {
  return groqRequest(messages, apiKey, {
    temperature: 0.6,
    max_tokens: 1200,
    response_format: { type: "json_object" },
  }).then((content) => JSON.parse(stripCodeFences(content)));
}

function callGroqChat(messages, apiKey) {
  return groqRequest(messages, apiKey, {
    temperature: 0.85,
    max_tokens: 700,
  });
}

module.exports = { callGroqJSON, callGroqChat };
