import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "astrologer", "admin"], default: "user" },
    wallet: { type: Number, default: 0 }, // moved inside the schema object
  },
  { timestamps: true } // schema options
);

export default mongoose.model("User", userSchema);
