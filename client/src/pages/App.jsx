import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getUser, isAuthed, logout } from "../lib/auth";
import VoiceAssistant from "../components/VoiceAssistant";

export default function App() {
  const nav = useNavigate();
  const user = getUser();
  const [astrologers, setAstrologers] = useState([]);
  const [wallet, setWallet] = useState(0);

  // Fetch only online astrologers
  useEffect(() => {
    api.get("/astrologers")  // backend defaults to isOnline: true
      .then(res => setAstrologers(res.data))
      .catch(err => console.error("Astrologers load error:", err));
  }, []);

  // Fetch wallet balance if logged in
  useEffect(() => {
    if (isAuthed()) fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet/me");
      setWallet(res.data.balance || 0);
    } catch (err) {
      console.error("Wallet fetch error:", err);
      setWallet(0);
    }
  };

  // Handle wallet recharge
  const handleRecharge = async () => {
    if (!isAuthed()) {
      alert("Please login first!");
      nav("/login");
      return;
    }

    const amount = parseFloat(prompt("Enter amount to add to wallet (₹):"));
    if (!amount || amount <= 0) return alert("Invalid amount");

    try {
      const res = await api.post("/wallet/add", { amount });
      setWallet(res.data.balance || wallet);
      alert(`₹${amount} added to your wallet successfully!`);
    } catch (err) {
      console.error("Wallet recharge error:", err);
      alert("Failed to add money to wallet.");
    }
  };

  // Handle connection to astrologer
  const handleConnect = (astro) => {
    if (!isAuthed()) {
      alert("Please login first!");
      nav("/login");
      return;
    }

    if (!astro.isOnline) {
      alert(`${astro.displayName} is currently offline.`);
      return;
    }

    if (astro.perMinuteRate === 0) {
      alert(`✅ Connected to ${astro.displayName} (Free Session / AI Assistant)`);
      // TODO: start free session or AI assistant
      return;
    }

    if (wallet >= astro.perMinuteRate) {
      alert(`✅ Connected to ${astro.displayName}`);
      // TODO: start paid session
    } else {
      if (window.confirm("Insufficient balance. Add money to wallet?")) {
        handleRecharge();
      }
    }
  };

  return (
    <div className="container">
      {/* Top Navbar */}
      <header className="flex justify-between items-center py-4">
        <h2>🔯 Astrotalk</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => nav("/")} className="btn">🏠 Home</button>

          {isAuthed() && (
            <>
              <span>💰 Wallet: ₹{wallet}</span>
              <button className="btn" onClick={() => nav("/wallet")}>Wallet</button>
              <button className="btn" onClick={() => nav("/dashboard")}>Dashboard</button>
              <button className="btn" onClick={() => logout(nav)}>Logout</button>
            </>
          )}

          {!isAuthed() && (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/signup" className="btn secondary">Signup</Link>
            </>
          )}
        </div>
      </header>

      {/* Astrologer Grid */}
      <h3 className="mt-4">Available Astrologers</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {astrologers.map((astro) => (
          <div key={astro._id} className="card p-4 border rounded shadow">
            <h4 className="font-bold">{astro.displayName}</h4>
            {astro.expertise?.length > 0 && (
              <p className="text-sm text-gray-600">Expertise: {astro.expertise.join(", ")}</p>
            )}
            {astro.languages?.length > 0 && (
              <p className="text-sm text-gray-600">Languages: {astro.languages.join(", ")}</p>
            )}
            <p className="mt-2">
              {astro.perMinuteRate === 0 ? "Free Session" : `₹${astro.perMinuteRate}/min`}
            </p>
            <p className={`font-semibold ${astro.isOnline ? "text-green-600" : "text-gray-500"}`}>
              {astro.isOnline ? "Online" : "Offline"}
            </p>
            <button className="btn mt-2 w-full" onClick={() => handleConnect(astro)}>
              Connect
            </button>
          </div>
        ))}
      </div>

      {/* Voice Assistant Floating Icon */}
      <VoiceAssistant />
    </div>
  );
}
