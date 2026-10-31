const dns = require("dns");
const mongoose = require("mongoose");

// Windows/corporate DNS often refuses mongodb+srv SRV lookups (querySrv ECONNREFUSED).
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const connectToMongo = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(mongoURI, {
    family: 4,
    serverSelectionTimeoutMS: 20000,
  });
  console.log("✅ MongoDB connected to", mongoose.connection.name);
};

module.exports = connectToMongo;
