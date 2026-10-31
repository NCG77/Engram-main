const { tokenize } = require("./memoryService");

const HUMAN_HALF_LIFE_DAYS = 14;
const TURN_HALF_LIFE_DAYS = 7;

const WEIGHTS = {
  humanFidelity: 0.45,
  humanLikeness: 0.2,
  memoryGrounding: 0.25,
  inCharacter: 0.1,
};

const ASSISTANT_LEAKAGE = [
  /\bas an ai\b/i,
  /\blanguage model\b/i,
  /\bas an assistant\b/i,
  /\bi('m| am) an? (ai|assistant|chatbot)\b/i,
  /\bi don't have (feelings|personal experiences)\b/i,
  /\bi cannot (pretend|role-?play)\b/i,
  /\bas a digital (simulation|twin|companion)\b/i,
  /\bi'm here to help\b/i,
  /\bhow can i assist you\b/i,
];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function round1(value) {
  return +Number(value).toFixed(1);
}

function memoryGroundingScore(reply, memories) {
  const replyTokens = tokenize(reply);
  if (replyTokens.length < 4) return 50;

  const memoryTokens = new Set(
    memories.flatMap((memory) => tokenize(`${memory.title} ${memory.text}`)),
  );
  if (!memoryTokens.size) return 0;

  const overlap = replyTokens.filter((token) => memoryTokens.has(token)).length;
  return clamp((overlap / replyTokens.length) * 100);
}

function inCharacterScore(reply) {
  const text = String(reply || "");
  if (!text.trim()) return 0;
  const hits = ASSISTANT_LEAKAGE.filter((pattern) => pattern.test(text)).length;
  if (!hits) return 100;
  return clamp(100 - hits * 35);
}

function recencyWeightedMean(items, getValue, getDate, halfLifeDays) {
  let weightedSum = 0;
  let weightTotal = 0;
  const now = Date.now();

  for (const item of items) {
    const value = Number(getValue(item));
    if (Number.isNaN(value)) continue;
    const ageDays = Math.max(
      0,
      (now - new Date(getDate(item)).getTime()) / 86400000,
    );
    const weight = Math.exp((-Math.LN2 * ageDays) / halfLifeDays);
    weightedSum += value * weight;
    weightTotal += weight;
  }

  if (!weightTotal) return null;
  return weightedSum / weightTotal;
}

function traitFidelityFromReview(review) {
  const ratings = review.ratings || {};
  const values = [
    ratings.openness,
    ratings.conscientiousness,
    ratings.extraversion,
    ratings.agreeableness,
    ratings.neuroticism,
  ]
    .map(Number)
    .filter((value) => !Number.isNaN(value));

  if (!values.length) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return (mean / 10) * 100;
}

function compositeAccuracy({
  humanFidelity,
  humanLikeness,
  memoryGrounding,
  inCharacter,
}) {
  const signals = [
    ["humanFidelity", humanFidelity],
    ["humanLikeness", humanLikeness],
    ["memoryGrounding", memoryGrounding],
    ["inCharacter", inCharacter],
  ].filter(([, value]) => value !== null && value !== undefined);

  if (!signals.length) {
    return { overallScore: 0, usedWeights: {}, missing: Object.keys(WEIGHTS) };
  }

  const weightTotal = signals.reduce(
    (sum, [key]) => sum + WEIGHTS[key],
    0,
  );
  const overallScore = signals.reduce(
    (sum, [key, value]) => sum + (WEIGHTS[key] / weightTotal) * value,
    0,
  );

  return {
    overallScore: round1(clamp(overallScore)),
    usedWeights: Object.fromEntries(
      signals.map(([key]) => [key, round1((WEIGHTS[key] / weightTotal) * 100)]),
    ),
    missing: Object.keys(WEIGHTS).filter(
      (key) => !signals.some(([used]) => used === key),
    ),
  };
}

function evaluateTurn(reply, memories) {
  const list = Array.isArray(memories) ? memories : [];
  return {
    memoryGrounding: round1(memoryGroundingScore(reply, list)),
    inCharacter: round1(inCharacterScore(reply)),
    memoriesUsed: list.length,
  };
}

module.exports = {
  WEIGHTS,
  HUMAN_HALF_LIFE_DAYS,
  TURN_HALF_LIFE_DAYS,
  clamp,
  round1,
  evaluateTurn,
  recencyWeightedMean,
  traitFidelityFromReview,
  compositeAccuracy,
};
