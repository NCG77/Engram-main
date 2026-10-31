const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    tokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("Session", sessionSchema);
