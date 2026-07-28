require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const checkDatabaseConnection = require("./middleware/dbconnection");
const userRoutes = require("./routes/userRoute");
const diaryRoutes = require("./routes/diaryRoute");
const auraRoutes = require("./routes/auraRoute");
const reviewRoutes = require("./routes/review");
const accuracyRoutes = require("./routes/accuracy");
const chatRoutes = require("./routes/chat");
const sessionRoutes = require("./routes/sessionRoute");
const { connectDB } = require("./db");

const app = express();
app.use(helmet());
app.use(compression());

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : "*";
app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Engram API is running successfully! 🚀", timestamp: new Date().toISOString() });
});

const { apiLimiter, expensiveApiLimiter } = require("./middleware/rateLimiter");

app.use("/api", checkDatabaseConnection);
app.use("/api", apiLimiter); // Apply general rate limit to all /api routes
app.use("/api/users", userRoutes);
app.use("/api/diary", expensiveApiLimiter, diaryRoutes); // Expensive (Pinecone upsert)
app.use("/api/aura", expensiveApiLimiter, auraRoutes); // Expensive (Groq API)
app.use("/api/reviews", reviewRoutes);
app.use("/api/accuracy", accuracyRoutes);
app.use("/api/chat", expensiveApiLimiter, chatRoutes); // Expensive (Groq API)
app.use("/api/sessions", sessionRoutes);

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn(`[${new Date().toISOString()}] ⚠️ MongoDB disconnected. Check network connection or MongoDB Atlas status.`);
});

mongoose.connection.on("error", (err) => {
  console.error(`[${new Date().toISOString()}] ❌ MongoDB runtime error:`, err.message);
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] 🚀 Server running locally on port ${PORT}`);
    });
  }).catch((err) => {
    console.error(`[${new Date().toISOString()}] ❌ Failed to start server:`, err.message);
  });
} else {
  connectDB().catch(console.error);
}

module.exports = app;
