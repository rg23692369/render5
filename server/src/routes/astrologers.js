import express from "express";
import AstrologerProfile from "../models/AstrologerProfile.js";
import { isAuthenticated, roleRequired } from "../middleware/auth.js";

const router = express.Router();

// ------------------ Get all astrologers ------------------
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

// ------------------ Get single astrologer by ID ------------------
router.get("/:id", async (req, res) => {
  try {
    const astrologer = await AstrologerProfile.findById(req.params.id)
      .populate("user", "username email");

    if (!astrologer) return res.status(404).json({ error: "Astrologer not found" });

    res.json(astrologer);
  } catch (err) {
    console.error("Astrologer fetch error:", err);
    res.status(500).json({ error: "Failed to fetch astrologer" });
  }
});

// ------------------ Update own profile (astrologer only) ------------------
router.put(
  "/me",
  isAuthenticated,
  roleRequired("astrologer"),
  async (req, res) => {
    try {
      const {
        displayName,
        bio,
        languages,
        expertise,
        perMinuteRate,
        isOnline,
      } = req.body;

      const updateData = {
        displayName: displayName || req.user.username,
        bio: bio || "",
        languages: Array.isArray(languages) ? languages : [],
        expertise: Array.isArray(expertise) ? expertise : [],
        perMinuteRate: perMinuteRate != null ? perMinuteRate : 0,
        isOnline: isOnline != null ? isOnline : true,
      };

      const profile = await AstrologerProfile.findOneAndUpdate(
        { user: req.user._id },
        updateData,
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
