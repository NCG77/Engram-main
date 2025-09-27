const express = require("express");

const {
  registerUser,
  loginUser,
  getUsers,
} = require("../controllers/userController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser); // New login route
router.get("/users", getUsers);

module.exports = router;

