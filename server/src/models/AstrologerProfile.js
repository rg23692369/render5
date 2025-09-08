import mongoose from "mongoose";

const astrologerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  displayName: { type: String, required: true },
  bio: { type: String, default: "" },
  languages: { type: [String], default: [] },
  expertise: { type: [String], default: [] },
  perMinuteRate: { type: Number, required: true, default: 0, min: 0 }, // allow 0 for free sessions
  isOnline: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("AstrologerProfile", astrologerProfileSchema);
