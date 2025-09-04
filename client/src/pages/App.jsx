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

  // Fetch astrologers list
  useEffect(() => {
    api.get("/astrologers")
      .then((res) => setAstrologers(res.data))
      .catch((err) => console.error("Astrologers load error:", err));
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

    if (astro.perMinuteRate === 0) {
      alert(`✅ Connected to ${astro.name} (Free Session / AI Assistant)`);
      // TODO: start AI / voice session
      return;
    }

    if (wallet >= astro.perMinuteRate) {
      alert(`✅ Connected to ${astro.name}`);
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
          {/* Home button */}
          <button onClick={() => nav("/")} className="btn">🏠 Home</button>

          {isAuthed() && (
            <>
              {/* Wallet balance + Wallet page */}
              <span>💰 Wallet: ₹{wallet}</span>
              <button className="btn" onClick={() => nav("/wallet")}>Wallet</button>

              {/* Dashboard */}
              <button className="btn" onClick={() => nav("/dashboard")}>Dashboard</button>

              {/* Logout */}
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
          <div key={astro._id} className="card">
            <h4>{astro.name}</h4>
            <p>{astro.profession}</p>
            <p>
              {astro.perMinuteRate === 0 ? "Free" : `₹${astro.perMinuteRate}/min`}
            </p>
            <button className="btn" onClick={() => handleConnect(astro)}>
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
