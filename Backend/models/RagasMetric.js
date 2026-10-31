const mongoose = require("mongoose");
const { Schema } = mongoose;

const RagasMetricSchema = new Schema({
    faithfulness: { type: Number, min: 0, max: 1 },
    answerRelevancy: { type: Number, min: 0, max: 1 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RagasMetric", RagasMetricSchema);
