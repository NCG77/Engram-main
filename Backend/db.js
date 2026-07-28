const mongoose = require("mongoose");
const { initPineconeIndex } = require("./utils/pinecone");

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
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      const db = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
      isConnected = db.connections[0].readyState === 1;
      console.log(`[${new Date().toISOString()}] ✅ MongoDB connected successfully.`);
      console.log(`[${new Date().toISOString()}] 🌲 Initializing Pinecone...`);
      await initPineconeIndex();
      console.log(`[${new Date().toISOString()}] ✅ Pinecone initialized successfully.`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error during startup:`, err.message);
      connectionPromise = null;
      throw err;
    }
  })();

  return connectionPromise;
};

module.exports = { connectDB };
