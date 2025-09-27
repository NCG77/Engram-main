const express = require("express");
const router = express.Router();

// import your controller
const { sendMessage } = require("../controllers/chatcontroller");

// mount the POST /api/chat/send endpoint
router.post("/send", sendMessage);

module.exports = router;
