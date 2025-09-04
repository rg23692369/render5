import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AstrologerProfile from "../models/AstrologerProfile.js";

const router = express.Router();

const signJWT = (user) => jwt.sign(
  { id: user._id, username: user.username, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, password required" });
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: role || "user" });

    if (user.role === "astrologer") {
      await AstrologerProfile.create({
        user: user._id, displayName: username, perMinuteRate: 10
      });
    }

    const token = signJWT(user);
    res.json({ token, user: { id: user._id, username, email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    if (!user) return res.status(400).json({ error: "User not found" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const token = signJWT(user);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
