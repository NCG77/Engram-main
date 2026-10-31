const mongoose = require("mongoose");
const { Schema } = mongoose;

const TurnEvalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    memoryGrounding: { type: Number, min: 0, max: 100, required: true },
    inCharacter: { type: Number, min: 0, max: 100, required: true },
    retrievedEntryIds: [{ type: String }],
  },
  { timestamps: true },
);

TurnEvalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("TurnEval", TurnEvalSchema);
