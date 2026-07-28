const mongoose = require("mongoose");
const { connectDB } = require("../db");

const checkDatabaseConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected after await");
    }
    next();
  } catch (error) {
    console.warn("⚠️ Database not connected. Current state:", mongoose.connection.readyState);
    return res.status(503).json({
      error: "Database connection unavailable. Please try again.",
    });
  }
};
module.exports = checkDatabaseConnection;
