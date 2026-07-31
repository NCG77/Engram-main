const https = require("https");

function rewriteQuery(userQuery, currentDate, apiKey) {
  return new Promise((resolve, reject) => {
    if (!apiKey) return resolve({ search_query: userQuery, metadata_filter: null });

    const prompt = `You are an AI query router for a diary database. The current date and time is ${currentDate}.
A user asked: "${userQuery}"

Your task is to:
1. Rewrite the query into an optimized semantic search string (focus on nouns, emotions, topics).
2. If the user mentions time (e.g., "yesterday", "last week", "in 2021"), extract a temporal metadata filter for 'createdAt' using MongoDB style operators ($gte, $lte) in ISO 8601 string format. If no time is mentioned, set metadata_filter to null.

Output ONLY a raw JSON object (no markdown, no backticks).
Format:
{
  "search_query": "string",
  "metadata_filter": { "createdAt": { "$gte": "2024-01-01T00:00:00.000Z", "$lte": "2024-01-31T23:59:59.999Z" } } // or null
}`;

    const requestData = {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
    };

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
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            resolve({ search_query: userQuery, metadata_filter: null });
          }
        } catch (e) {
          resolve({ search_query: userQuery, metadata_filter: null });
        }
      });
    });

    req.on("error", () => resolve({ search_query: userQuery, metadata_filter: null }));
    req.write(JSON.stringify(requestData));
    req.end();
  });
}

module.exports = { rewriteQuery };
