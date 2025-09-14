// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth.js";
import astrologerRoutes from "./routes/astrologers.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import aiRoutes from "./routes/ai.js";

// Load environment variables
dotenv.config();

// App setup
const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// ✅ Middleware
app.use(express.json());
app.use(helmet()); // Secure HTTP headers
app.use(morgan("dev")); // HTTP logging

// ✅ CORS setup
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: ${origin} not allowed`), false);
    },
    credentials: true,
  })
);

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Astrotalk API" });
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/astrologers", astrologerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);

// ✅ Validate required envs
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI/MONGODB_URI");
  process.exit(1);
}
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay keys missing → payments may not work properly.");
}

// ✅ Connect to MongoDB & start server
mongoose
  .connect(MONGO_URI, {
    autoIndex: process.env.NODE_ENV !== "production",
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err?.message || err);
    process.exit(1);
  });

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message || err);
  res.status(500).json({ error: "Internal server error" });
});
