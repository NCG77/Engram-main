const mongoose = require("mongoose");
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ Database not connected. Current state:", mongoose.connection.readyState);
    return res.status(503).json({
      error: "Database connection unavailable. Please try again.",
    });
  }
  next();
};
module.exports = checkDatabaseConnection;
