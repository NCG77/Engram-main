const https = require("https");

function callAiApi(messages, apiKey) {
  return new Promise((resolve, reject) => {
    if (!apiKey) return reject(new Error("API Key is missing"));

    const requestData = {
      model: "llama-3.1-8b-instant",
      messages: messages,
      temperature: 0.1,
      max_tokens: 500,
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
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content);
          } else {
            reject(new Error("Invalid API response format"));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify(requestData));
    req.end();
  });
}


async function evaluateFaithfulness(question, context, answer, apiKey) {
  const prompt = `
    You are an impartial judge evaluating a Retrieval-Augmented Generation (RAG) system.
    Your task is to determine if the generated answer is faithful to the provided context.
    
    Context:
    ${context}
    
    Question:
    ${question}
    
    Answer:
    ${answer}
    
    Is the Answer strictly based on the Context? Output only a JSON object with a 'score' (1 for Yes, 0 for No) and a 'reason' string.
    Example: {"score": 1, "reason": "The answer is directly supported by the context."}
  `;

  const messages = [{ role: "user", content: prompt }];
  try {
    const result = await callAiApi(messages, apiKey);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { score: 0, reason: "Failed to parse LLM response" };
  } catch (error) {
    console.error("Faithfulness Evaluation Error:", error);
    return { score: 0, reason: "Evaluation API call failed" };
  }
}


async function evaluateAnswerRelevancy(question, answer, apiKey) {
  const prompt = `
    You are an impartial judge. Your task is to evaluate the relevancy of the generated answer to the original question.
    
    Question:
    ${question}
    
    Answer:
    ${answer}
    
    Does the answer directly address the question without providing completely unrelated information?
    Output only a JSON object with a 'score' (1 for highly relevant, 0.5 for partially relevant, 0 for irrelevant) and a 'reason' string.
    Example: {"score": 1, "reason": "The answer directly addresses the question."}
  `;

  const messages = [{ role: "user", content: prompt }];
  try {
    const result = await callAiApi(messages, apiKey);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { score: 0, reason: "Failed to parse LLM response" };
  } catch (error) {
    console.error("Answer Relevancy Evaluation Error:", error);
    return { score: 0, reason: "Evaluation API call failed" };
  }
}

module.exports = {
  evaluateFaithfulness,
  evaluateAnswerRelevancy
};
