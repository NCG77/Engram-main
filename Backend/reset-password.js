const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    serverSelectionTimeoutMS: 20000,
  });

  const admin = mongoose.connection.db.admin();
  const { databases } = await admin.listDatabases();
  const targetId = new mongoose.Types.ObjectId("67fa79db62650f958d393dc3");
  const newPassword = process.argv[2] || "swastikbruh";
  const cleanEmail = "swastik@example.com";
  const hash = await bcrypt.hash(newPassword, 10);

  let updated = false;
  for (const dbInfo of databases) {
    const db = mongoose.connection.client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      if (!/user/i.test(col.name)) continue;
      const doc = await db.collection(col.name).findOne({
        $or: [{ _id: targetId }, { email: /swastik@example\.com/i }],
      });
      if (!doc) continue;

      const result = await db.collection(col.name).updateOne(
        { _id: doc._id },
        {
          $set: {
            email: cleanEmail,
            name: String(doc.name || "Swastik").replace(/;+$/, ""),
            password: hash,
          },
        },
      );
      console.log(
        `Updated ${dbInfo.name}.${col.name} ${doc._id} matched=${result.matchedCount} modified=${result.modifiedCount}`,
      );
      console.log(`Login email: ${cleanEmail}`);
      updated = true;
    }
  }

  if (!updated) {
    console.log("User document not found on this cluster.");
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
