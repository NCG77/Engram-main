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
const { initPineconeIndex } = require("./utils/pinecone");

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

const mongooseOptions = {
  maxPoolSize: 5,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  bufferCommands: false,
  retryWrites: true,
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    isConnected = db.connections[0].readyState === 1;
    console.log(`[${new Date().toISOString()}] ✅ MongoDB connected successfully.`);
    console.log(`[${new Date().toISOString()}] 🌲 Initializing Pinecone...`);
    await initPineconeIndex();
    console.log(`[${new Date().toISOString()}] ✅ Pinecone initialized successfully.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error during startup:`, err.message);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Engram API is running successfully! 🚀", timestamp: new Date().toISOString() });
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
  isConnected = false;
  console.warn(`[${new Date().toISOString()}] ⚠️ MongoDB disconnected. Check network connection or MongoDB Atlas status.`);
});

mongoose.connection.on("error", (err) => {
  console.error(`[${new Date().toISOString()}] ❌ MongoDB runtime error:`, err.message);
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] 🚀 Server running locally on port ${PORT}`);
  });
}

module.exports = app;
