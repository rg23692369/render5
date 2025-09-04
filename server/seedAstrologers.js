// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import AstrologerProfile from "./src/models/AstrologerProfile.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // Prevent duplicates (check if seed data already exists)
    const existing = await User.findOne({ email: "rama1@example.com" });
    if (existing) {
      console.log("⚠️ Seed data already exists, skipping.");
      return process.exit(0);
    }

    // Create astrologer user accounts
    const astro1 = await User.create({
      username: "rama1",
      email: "rama1@example.com",
      password: "password123", // ⚠️ hash in production!
      role: "astrologer",
    });

    const astro2 = await User.create({
      username: "sita2",
      email: "sita2@example.com",
      password: "password123",
      role: "astrologer",
    });

    // Create astrologer profiles
    await AstrologerProfile.create([
      {
        user: astro1._id,
        displayName: "Pandit Rama",
        bio: "Expert in Vedic Astrology with 10 years experience.",
        languages: ["Hindi", "English"],
        expertise: ["Horoscope", "Matchmaking"],
        perMinuteRate: 50,
        isOnline: true,
      },
      {
        user: astro2._id,
        displayName: "Astro Sita",
        bio: "Specialist in Palmistry & Tarot Reading.",
        languages: ["English", "Bengali"],
        expertise: ["Tarot", "Palmistry"],
        perMinuteRate: 0, // free astrologer like AI
        isOnline: true,
      },
    ]);

    console.log("🌟 Seed data inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
