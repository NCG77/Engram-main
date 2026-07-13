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
const app = express();
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
    ].filter(Boolean),
  }),
);
app.use(express.json());
const mongooseOptions = {
  maxPoolSize: 5,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  bufferCommands: false,
  retryWrites: true,
};
mongoose
  .connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
app.get("/", (req, res) => {
  res.status(200).json({ message: "Engram API is running successfully! 🚀" });
});
app.use("/api", checkDatabaseConnection);
app.use("/api/users", userRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/aura", auraRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/accuracy", accuracyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});
const { initPineconeIndex } = require("./utils/pinecone");
function startServer() {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await initPineconeIndex();
  });
}
