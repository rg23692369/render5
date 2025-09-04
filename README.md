# Astrotalk Fullstack (MongoDB + JWT + Razorpay + React)

## 1) Backend
```bash
cd server
cp .env.example .env
# fill your Mongo URI, JWT_SECRET, Razorpay keys
npm install
npm run dev
```
Server starts on **PORT 4000** by default.

## 2) Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Frontend runs on **5173**.

## 3) Features
- Signup/Login (stored in MongoDB)
- Astrologer profile with per-minute rate
- User dashboard to book Call/Chat
- Razorpay Checkout + signature verification
- Safe fallback if Razorpay keys are missing (dummy order)
