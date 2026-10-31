const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const authMiddleware = require("../middleware/authmiddleware");
const { isValidObjectId } = require("../utils/date");

const ALLOWED_ROLES = new Set(["user", "assistant"]);

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (message) =>
        message &&
        ALLOWED_ROLES.has(message.role) &&
        typeof message.content === "string",
    )
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({
      updatedAt: -1,
    });
    res.json({ sessions });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, messages, tokens } = req.body;

    const newSession = await Session.create({
      userId: req.userId,
      title: title || "New Chat",
      messages: sanitizeMessages(messages),
      tokens: Number(tokens) > 0 ? Number(tokens) : 0,
    });

    res.status(201).json(newSession);
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "Failed to create new session." });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Session not found or unauthorized." });
    }

    const { messages, tokens, title } = req.body;
    const update = {};

    if (messages !== undefined) {
      update.messages = sanitizeMessages(messages);
    }
    if (tokens !== undefined) {
      update.tokens = Number(tokens) > 0 ? Number(tokens) : 0;
    }
    if (title) {
      update.title = title;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const updatedSession = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: update },
      { new: true },
    );

    if (!updatedSession) {
      return res
        .status(404)
        .json({ error: "Session not found or unauthorized." });
    }

    res.json(updatedSession);
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ error: "Failed to update session." });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Session not found or unauthorized." });
    }

    const deletedSession = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deletedSession) {
      return res.status(404).json({ error: "Session not found or unauthorized." });
    }
    res.json({ message: "Session deleted successfully!" });
  } catch (err) {
    console.error("Error deleting session", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

module.exports = router;
