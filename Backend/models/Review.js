// models/Review.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ratings: {
        openness: { type: Number, min: 0, max: 10, required: true },
        conscientiousness: { type: Number, min: 0, max: 10, required: true },
        extraversion: { type: Number, min: 0, max: 10, required: true },
        agreeableness: { type: Number, min: 0, max: 10, required: true },
        neuroticism: { type: Number, min: 0, max: 10, required: true },
    },
    thoughtsFeedback: { type: String },
    comments: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);