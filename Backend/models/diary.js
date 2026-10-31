const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "Untitled",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

diarySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Diary", diarySchema);
