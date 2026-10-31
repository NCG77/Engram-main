const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const chatController = require("../controllers/chatcontroller");
const authenticateUser = require("../middleware/authmiddleware");

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many chat requests, please slow down" },
});

router.post("/send", authenticateUser, chatLimiter, chatController.sendMessage);

module.exports = router;
