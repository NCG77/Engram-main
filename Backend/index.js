require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToMongo = require("./db");
const userRoutes = require("./routes/userRoute");
const diaryRoutes = require("./routes/diaryRoute");
const auraRoutes = require("./routes/auraRoute");
const reviewRoutes = require("./routes/review");
const accuracyRoutes = require("./routes/accuracy");
const chatRoutes = require("./routes/chat");
const sessionRoutes = require("./routes/sessionRoute");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

connectToMongo().catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  console.error("API is up, but login, diary, and chat need a reachable MONGO_URI.");
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Engram API is running successfully! 🚀" });
});

app.use("/api/users", userRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/aura", auraRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/accuracy", accuracyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: "Internal server error" });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
