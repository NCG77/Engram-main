const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

function normalizeEmail(email) {
  return String(email || "")
    .toLowerCase()
    .trim()
    .replace(/[;,\s]+$/g, "");
}

function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function frontendBase() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    "",
  );
}

exports.registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    res.json({
      message: "Login successful",
      token,
      name: user.name,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.forgotPassword = async (req, res) => {
  const generic = {
    message: "If an account exists for that email, you can reset the password.",
  };

  try {
    const email = normalizeEmail(req.body.email);
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email });
    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetUrl = `${frontendBase()}/reset-password?token=${rawToken}`;

    if (user) {
      await User.updateOne(
        { _id: user._id },
        {
          passwordResetToken: hashResetToken(rawToken),
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        },
      );
      console.log(`Password reset link for ${email}: ${resetUrl}`);
    }

    // Same shape always so existence is not leaked. Dummy token is rejected on submit.
    return res.json({
      ...generic,
      resetUrl: user ? resetUrl : `${frontendBase()}/reset-password?token=invalid`,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ error: "Could not start password reset" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const rawToken = String(req.body.token || "").trim();
    const password = req.body.password;

    if (!rawToken || rawToken === "invalid") {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }
    if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const user = await User.findOne({
      passwordResetToken: hashResetToken(rawToken),
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +password");

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ message: "Password updated. You can sign in now." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({ error: "Could not reset password" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
};
