const express = require("express");
const {
  createDiaryEntry,
  getDiaryEntries,
  getAura,
} = require("../controllers/diaryController");
const authenticateUser = require("../middleware/authmiddleware");

const router = express.Router();

// POST /api/diary/create (requires login)
router.post(
  "/create",
  authenticateUser,
  (req, res, next) => {
    req.body.userId = req.userId;
    next();
  },
  createDiaryEntry
);

// GET /api/diary (requires login)
router.get(
  "/",
  authenticateUser,
  (req, res, next) => {
    req.params.userId = req.userId;
    next();
  },
  getDiaryEntries
);

module.exports = router;
