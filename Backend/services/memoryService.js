const Diary = require("../models/diary");

const STOPWORDS = new Set(
  `a an the and or but if in on at to for of as is was were be been being it this that these those i you he she we they my your his her our their me him us them not no so than then with from by about into over after before up down out just can will would could should do does did have has had what when where which who how why`.split(
    " ",
  ),
);

const TOP_K = 4;
const MAX_SNIPPET = 420;
const RECENCY_HALF_LIFE_DAYS = 30;
const RELEVANCE_WEIGHT = 0.7;
const RECENCY_WEIGHT = 0.3;

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function termFrequency(tokens) {
  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  const length = tokens.length || 1;
  const tf = new Map();
  for (const [token, count] of counts) {
    tf.set(token, count / length);
  }
  return tf;
}

function cosineSimilarity(tfA, tfB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [token, value] of tfA) {
    normA += value * value;
    if (tfB.has(token)) {
      dot += value * tfB.get(token);
    }
  }
  for (const value of tfB.values()) {
    normB += value * value;
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function recencyScore(createdAt, now = Date.now()) {
  const ageDays = Math.max(0, (now - new Date(createdAt).getTime()) / 86400000);
  return Math.exp((-Math.LN2 * ageDays) / RECENCY_HALF_LIFE_DAYS);
}

function snippet(text) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= MAX_SNIPPET) return cleaned;
  return `${cleaned.slice(0, MAX_SNIPPET).trim()}…`;
}

async function retrieveMemories(userId, query, limit = TOP_K) {
  const diaries = await Diary.find({ userId }).sort({ createdAt: -1 }).lean();
  if (!diaries.length) return [];

  const queryTf = termFrequency(tokenize(query));
  const now = Date.now();

  const ranked = diaries.map((entry) => {
    const entryTf = termFrequency(tokenize(`${entry.title} ${entry.content}`));
    const relevance = cosineSimilarity(queryTf, entryTf);
    const recency = recencyScore(entry.createdAt, now);
    const hasQuery = tokenize(query).length > 0;
    const score = hasQuery
      ? RELEVANCE_WEIGHT * relevance + RECENCY_WEIGHT * recency
      : recency;

    return {
      id: String(entry._id),
      title: entry.title || "Untitled",
      date: entry.createdAt,
      text: snippet(entry.content),
      score,
      relevance,
      recency,
    };
  });

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

module.exports = {
  retrieveMemories,
  tokenize,
  recencyScore,
};
