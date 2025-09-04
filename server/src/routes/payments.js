import express from "express";
import User from "../models/User.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Add money to wallet after successful payment
router.post("/add-to-wallet", isAuthenticated, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  try {
    const user = await User.findById(req.user._id);
    user.wallet += amount;
    await user.save();
    res.json({ balance: user.wallet, message: "Wallet updated successfully" });
  } catch (err) {
    console.error("Wallet top-up error:", err);
    res.status(500).json({ error: "Failed to add balance" });
  }
});

export default router;
