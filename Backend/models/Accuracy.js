const mongoose = require("mongoose");
const { Schema } = mongoose;
const { startOfUtcDay } = require("../utils/date");

const AccuracySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: () => startOfUtcDay(),
      required: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    breakdown: {
      openness: Number,
      conscientiousness: Number,
      extraversion: Number,
      agreeableness: Number,
      neuroticism: Number,
      humanFidelity: Number,
      humanLikeness: Number,
      memoryGrounding: Number,
      inCharacter: Number,
    },
    sampleCounts: {
      reviews: { type: Number, default: 0 },
      turns: { type: Number, default: 0 },
    },
    method: { type: String, default: "composite-v1" },
  },
  { timestamps: true },
);

AccuracySchema.index(
  { userId: 1, date: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } },
);

module.exports = mongoose.model("Accuracy", AccuracySchema);
