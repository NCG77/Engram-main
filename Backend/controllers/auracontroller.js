const { spawn } = require("child_process");
const path = require("path");
const Diary = require("../models/diary");
const Aura = require("../models/Aura");

const updateAura = async (req, res) => {
  console.log("✅ Hit /api/aura/update");

  try {
    // 1️⃣ Fetch all diary entries for the user
    const diaries = await Diary.find({ userId: req.userId }).sort({
      createdAt: 1,
    });
    if (!diaries.length) {
      console.log("❌ No diaries found");
      return res.status(400).json({ error: "No diary entries to analyze." });
    }

    const payload = diaries.map((d) => ({ text: d.content }));

    // 2️⃣ Prepare Python extractor path
    const extractorPath = path.join(
      __dirname,
      "../TextExtraction/Extractor.py"
    );
    console.log("🚀 Spawning Python with:", extractorPath);

    // 3️⃣ Spawn the Python process using stdin
    const py = spawn("python", [extractorPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    // Send diary content to Python via stdin
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

    py.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      console.log("🐍 Python stdout:", chunk.toString());
    });

    py.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      console.error("🐛 Python stderr:", chunk.toString());
    });

    py.on("error", (err) => {
      console.error("❌ Python process error:", err);
      return res.status(500).json({ error: "Failed to start Python script." });
    });

    py.on("close", async (code) => {
      console.log("🔚 Python process exited with code:", code);
      if (code !== 0) {
        return res.status(500).json({
          error: "Python extractor failed",
          details: stderr,
        });
      }

      let personality;
      try {
        personality = JSON.parse(stdout);
      } catch (err) {
        console.error("❌ JSON parse error:", err);
        return res.status(500).json({
          error: "Invalid JSON from Python extractor",
          raw: stdout,
        });
      }

      // 4️⃣ Save or update the user's aura
      try {
        const auraDoc = await Aura.findOneAndUpdate(
          { userId: req.userId },
          { personality },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log("✅ Aura updated:", auraDoc._id);
        return res.status(200).json(auraDoc);
      } catch (err) {
        console.error("❌ MongoDB Aura save error:", err);
        return res.status(500).json({ error: "Failed to save aura" });
      }
    });
  } catch (err) {
    console.error("❌ updateAura error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { updateAura };
