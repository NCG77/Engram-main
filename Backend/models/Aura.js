const mongoose = require("mongoose");

const traitSchema = new mongoose.Schema(
  {
    Description: { type: String, default: "" },
  },
  { _id: false },
);

const auraSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personality: {
      Openness: traitSchema,
      Conscientiousness: traitSchema,
      Extraversion: traitSchema,
      Agreeableness: traitSchema,
      Neuroticism: traitSchema,
      Relations: traitSchema,
      Other: traitSchema,
      Style: traitSchema,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Aura", auraSchema);
