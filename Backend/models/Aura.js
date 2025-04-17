// models/Aura.js
const mongoose = require("mongoose");
const auraSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personality: {
      Openness: { Description: String },
      Conscientiousness: { Description: String },
      Extraversion: { Description: String },
      Agreeableness: { Description: String },
      Neuroticism: { Description: String },
      Relations: { Description: String },
      Other: { Description: String },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Aura", auraSchema);
