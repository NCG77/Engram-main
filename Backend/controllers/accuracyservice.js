const Review = require("../models/Review");
const Accuracy = require("../models/Accuracy");
const TurnEval = require("../models/TurnEval");
const { startOfUtcDay } = require("../utils/date");
const {
  HUMAN_HALF_LIFE_DAYS,
  TURN_HALF_LIFE_DAYS,
  recencyWeightedMean,
  traitFidelityFromReview,
  compositeAccuracy,
  round1,
} = require("../services/personaEval");

const TRAITS = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

function traitBreakdown(reviews) {
  const breakdown = {};
  for (const trait of TRAITS) {
    const scored = recencyWeightedMean(
      reviews.filter(
        (review) => review.ratings && review.ratings[trait] != null,
      ),
      (review) => (Number(review.ratings[trait]) / 10) * 100,
      (review) => review.createdAt,
      HUMAN_HALF_LIFE_DAYS,
    );
    breakdown[trait] = scored === null ? null : round1(scored);
  }
  return breakdown;
}

async function recomputeAccuracy(userId) {
  if (!userId) return null;

  const [reviews, turns] = await Promise.all([
    Review.find({ user: userId }).sort({ createdAt: -1 }),
    TurnEval.find({ userId }).sort({ createdAt: -1 }).limit(80),
  ]);

  const traitScores = traitBreakdown(reviews);
  const humanFidelity = recencyWeightedMean(
    reviews,
    traitFidelityFromReview,
    (review) => review.createdAt,
    HUMAN_HALF_LIFE_DAYS,
  );
  const humanLikeness = recencyWeightedMean(
    reviews.filter((review) => review.overallLikeness != null),
    (review) => (Number(review.overallLikeness) / 10) * 100,
    (review) => review.createdAt,
    HUMAN_HALF_LIFE_DAYS,
  );
  const memoryGrounding = recencyWeightedMean(
    turns,
    (turn) => turn.memoryGrounding,
    (turn) => turn.createdAt,
    TURN_HALF_LIFE_DAYS,
  );
  const inCharacter = recencyWeightedMean(
    turns,
    (turn) => turn.inCharacter,
    (turn) => turn.createdAt,
    TURN_HALF_LIFE_DAYS,
  );

  const composite = compositeAccuracy({
    humanFidelity,
    humanLikeness: humanLikeness ?? humanFidelity,
    memoryGrounding,
    inCharacter,
  });

  const breakdown = {
    ...Object.fromEntries(
      TRAITS.map((trait) => [trait, traitScores[trait] ?? 0]),
    ),
    humanFidelity: humanFidelity === null ? 0 : round1(humanFidelity),
    humanLikeness: round1(humanLikeness ?? humanFidelity ?? 0),
    memoryGrounding: memoryGrounding === null ? 0 : round1(memoryGrounding),
    inCharacter: inCharacter === null ? 0 : round1(inCharacter),
  };

  return Accuracy.findOneAndUpdate(
    { userId, date: startOfUtcDay() },
    {
      userId,
      date: startOfUtcDay(),
      overallScore: composite.overallScore,
      breakdown,
      sampleCounts: {
        reviews: reviews.length,
        turns: turns.length,
      },
      method: "composite-v1",
    },
    { upsert: true, new: true },
  );
}

module.exports = { recomputeAccuracy };
