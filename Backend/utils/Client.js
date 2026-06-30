const https = require("https");
function callGroqJSON(messages, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = JSON.parse(data);
              let content = json.choices[0].message.content
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
              const parsed = JSON.parse(content);
              return resolve(parsed);
            } catch (e) {
              return reject(
                new Error("Failed to parse Groq JSON: " + e.message),
              );
            }
          } else {
            return reject(
              new Error(`Groq API error ${res.statusCode}: ${data}`),
            );
          }
        });
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}
function callGroqChat(messages, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = JSON.parse(data);
              const content = json.choices[0].message.content.trim();
              return resolve(content);
            } catch (e) {
              return reject(
                new Error("Groq response not valid JSON: " + e.message),
              );
            }
          } else {
            return reject(
              new Error(`Groq API error ${res.statusCode}: ${data}`),
            );
          }
        });
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}
module.exports = { callGroqJSON, callGroqChat };
