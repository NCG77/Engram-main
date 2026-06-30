const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatcontroller");
const authenticateUser = require("../middleware/authmiddleware");
router.post("/send", authenticateUser, chatController.sendMessage);
module.exports = router;
