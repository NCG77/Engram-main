// routes/reviews.js
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const authenticateUser = require("../middleware/authmiddleware");
const { recomputeAccuracy } = require("../controllers/accuracyservice");

// POST /api/reviews
console.log("Review route loaded.");
router.post("/", authenticateUser, async (req, res) => {
    const { ratings, thoughtsFeedback, comments } = req.body;
    const review = new Review({
        user: req.userId,
        ratings,
        thoughtsFeedback,
        comments,
    });
    await review.save();
    // Recompute accuracy after each new review
    await recomputeAccuracy();
    res.status(201).json({ message: "Review saved" });
});

module.exports = router;