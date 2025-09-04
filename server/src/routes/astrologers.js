import express from "express";
import AstrologerProfile from "../models/AstrologerProfile.js";
import { isAuthenticated, roleRequired } from "../middleware/auth.js";

const router = express.Router();

/**
 * ✅ Get all astrologers (default: only online)
 * Query params:
 *   ?all=1 → fetch everyone
 *   ?q=tarot → search by name/expertise/languages
 */
router.get("/", async (req, res) => {
  try {
    const { all, q } = req.query;
    const filter = all ? {} : { isOnline: true };

    if (q) {
      filter.$or = [
        { displayName: { $regex: q, $options: "i" } },
        { expertise: { $elemMatch: { $regex: q, $options: "i" } } },
        { languages: { $elemMatch: { $regex: q, $options: "i" } } },
      ];
    }

    const astrologers = await AstrologerProfile.find(filter)
      .populate("user", "username email")
      .sort({ isOnline: -1, perMinuteRate: 1, displayName: 1 });

    res.json(astrologers);
  } catch (err) {
    console.error("Astrologers fetch error:", err);
    res.status(500).json({ error: "Failed to fetch astrologers" });
  }
});

/**
 * ✅ Get single astrologer by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const astrologer = await AstrologerProfile.findById(req.params.id)
      .populate("user", "username email");

    if (!astrologer) {
      return res.status(404).json({ error: "Astrologer not found" });
    }

    res.json(astrologer);
  } catch (err) {
    console.error("Astrologer fetch error:", err);
    res.status(500).json({ error: "Failed to fetch astrologer" });
  }
});

/**
 * ✅ Astrologer updates their own profile
 * Only allowed if role = astrologer
 */
router.put(
  "/me",
  isAuthenticated,          // check logged-in
  roleRequired("astrologer"), // check role
  async (req, res) => {
    try {
      const { displayName, bio, languages, expertise, perMinuteRate, isOnline } = req.body;

      const profile = await AstrologerProfile.findOneAndUpdate(
        { user: req.user._id },
        { displayName, bio, languages, expertise, perMinuteRate, isOnline },
        { new: true, upsert: true }
      ).populate("user", "username email");

      res.json(profile);
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

export default router;
