const express = require("express");
const {
  createDiaryEntry,
  getDiaryEntries,
  deleteDiaryEntry,
  getAura,
} = require("../controllers/diaryController");
const authenticateUser = require("../middleware/authmiddleware");
const router = express.Router();
router.post(
  "/create",
  authenticateUser,
  (req, res, next) => {
    req.body.userId = req.userId;
    next();
  },
  createDiaryEntry,
);
router.get(
  "/",
  authenticateUser,
  (req, res, next) => {
    req.params.userId = req.userId;
    next();
  },
  getDiaryEntries,
);
router.delete(
  "/:id",
  authenticateUser,
  deleteDiaryEntry
);
module.exports = router;
