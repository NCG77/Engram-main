const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingField = { type: Number, min: 0, max: 10 };

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
  // 0-10 = how well the twin matched THIS trait of the user, not trait intensity.
  ratings: {
    openness: ratingField,
    conscientiousness: ratingField,
    extraversion: ratingField,
    agreeableness: ratingField,
    neuroticism: ratingField,
  },
  // 0-10 = "this sounded like me" (PersonaChat-style overall likeness).
  overallLikeness: { type: Number, min: 0, max: 10 },
  thoughtsFeedback: { type: String, default: "" },
  comments: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);
