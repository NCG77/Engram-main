const express = require("express");
const authenticateUser = require("../middleware/authmiddleware");
const { updateAura, getAura } = require("../controllers/auracontroller");

const router = express.Router();

router.get("/", authenticateUser, getAura);
router.post("/update", authenticateUser, updateAura);

module.exports = router;
