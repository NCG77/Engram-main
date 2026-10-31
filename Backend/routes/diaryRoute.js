const express = require("express");
const {
  createDiaryEntry,
  getDiaryEntries,
} = require("../controllers/diaryController");
const authenticateUser = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/create", authenticateUser, createDiaryEntry);
router.get("/", authenticateUser, getDiaryEntries);

module.exports = router;
