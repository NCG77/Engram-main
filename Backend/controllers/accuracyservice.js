
const Review = require("../models/Review");
const Accuracy = require("../models/Accuracy");
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
  const overallScore = +(
    Object.values(breakdown).reduce((a, b) => a + b, 0) / 5
  ).toFixed(1);
  const today = new Date().setHours(0, 0, 0, 0);
  await Accuracy.findOneAndUpdate(
    { date: today },
    { overallScore, breakdown, date: today },
    { upsert: true },
  );
}
module.exports = { recomputeAccuracy };
