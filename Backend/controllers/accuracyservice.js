
const Review = require("../models/Review");
const Accuracy = require("../models/Accuracy");
const RagasMetric = require("../models/RagasMetric");
async function recomputeAccuracy() {
  const reviews = await Review.find();
  if (!reviews.length) return;
  const sum = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };
  reviews.forEach((r) => {
    Object.entries(r.ratings).forEach(([k, v]) => (sum[k] += v));
  });
  const count = reviews.length;
  const breakdown = Object.fromEntries(
    Object.entries(sum).map(([k, total]) => [k, +(total / count).toFixed(1)]),
  );

  const ragasMetrics = await RagasMetric.find();
  if (ragasMetrics.length > 0) {
    const rCount = ragasMetrics.length;
    let rFaithSum = 0, rRelSum = 0;
    ragasMetrics.forEach(m => {
      rFaithSum += m.faithfulness;
      rRelSum += m.answerRelevancy;
    });
    // Convert 0-1 score to 0-10 score for consistency
    breakdown.ragasFaithfulness = +((rFaithSum / rCount) * 10).toFixed(1);
    breakdown.ragasAnswerRelevancy = +((rRelSum / rCount) * 10).toFixed(1);
  } else {
    breakdown.ragasFaithfulness = 10.0;
    breakdown.ragasAnswerRelevancy = 10.0;
  }

  const overallScore = +(
    Object.values(breakdown).reduce((a, b) => a + b, 0) / 7
  ).toFixed(1);
  const today = new Date().setHours(0, 0, 0, 0);
  await Accuracy.findOneAndUpdate(
    { date: today },
    { overallScore, breakdown, date: today },
    { upsert: true },
  );
}
async function saveRagasMetric(faithfulnessScore, relevancyScore) {
  const metric = new RagasMetric({
    faithfulness: faithfulnessScore,
    answerRelevancy: relevancyScore
  });
  await metric.save();
  await recomputeAccuracy();
}

module.exports = { recomputeAccuracy, saveRagasMetric };
