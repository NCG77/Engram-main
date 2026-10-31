const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const authenticateUser = require("../middleware/authmiddleware");
const { recomputeAccuracy } = require("../controllers/accuracyservice");
const { isValidObjectId } = require("../utils/date");

const REQUIRED_TRAITS = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

function readOptionalRating(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  if (Number.isNaN(number) || number < 0 || number > 10) return NaN;
  return number;
}

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { ratings, thoughtsFeedback, comments, overallLikeness, sessionId } =
      req.body;

    const likeness = readOptionalRating(overallLikeness);
    if (overallLikeness !== undefined && Number.isNaN(likeness)) {
      return res.status(400).json({
        error: "overallLikeness must be a number between 0 and 10",
      });
    }

    let normalizedRatings;
    if (ratings && typeof ratings === "object") {
      normalizedRatings = {};
      for (const trait of REQUIRED_TRAITS) {
        if (ratings[trait] === undefined || ratings[trait] === null) continue;
        const value = Number(ratings[trait]);
        if (Number.isNaN(value) || value < 0 || value > 10) {
          return res.status(400).json({
            error: `Rating for ${trait} must be a number between 0 and 10`,
          });
        }
        normalizedRatings[trait] = value;
      }
      if (!Object.keys(normalizedRatings).length) {
        normalizedRatings = undefined;
      }
    }

    if (!normalizedRatings && likeness === undefined) {
      return res.status(400).json({
        error: "Provide overallLikeness and/or OCEAN trait fidelity ratings",
      });
    }

    const review = await Review.create({
      user: req.userId,
      sessionId: sessionId && isValidObjectId(sessionId) ? sessionId : undefined,
      ratings: normalizedRatings,
      overallLikeness: likeness,
      thoughtsFeedback,
      comments,
    });

    const accuracy = await recomputeAccuracy(req.userId);
    res.status(201).json({
      message: "Review saved",
      reviewId: review._id,
      accuracy: accuracy
        ? {
            overallScore: accuracy.overallScore,
            breakdown: accuracy.breakdown || {},
            sampleCounts: accuracy.sampleCounts || { reviews: 0, turns: 0 },
            method: accuracy.method || "composite-v1",
          }
        : null,
    });
  } catch (err) {
    console.error("Review save error:", err);
    res.status(500).json({ error: "Failed to save review" });
  }
});

module.exports = router;
