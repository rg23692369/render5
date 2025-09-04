import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getUser, isAuthed, logout } from "../lib/auth";
import VoiceAssistant from "../components/VoiceAssistant";

export default function Home() {
  const [astrologers, setAstrologers] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const user = getUser();

  useEffect(() => {
    let mounted = true;

    // Fetch astrologers; keep only online to match your home requirement
    api.get("/astrologers")
      .then(res => {
        if (!mounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setAstrologers(list.filter(a => a?.isOnline));
      })
      .catch(err => {
        console.error("Astrologers fetch error:", err?.response?.data || err.message);
        if (mounted) setAstrologers([]);
      })
      .finally(() => mounted && setLoading(false));

    // Fetch wallet if user is logged in (ignore 401s)
    if (isAuthed()) {
      api.get("/wallet/me")
        .then(res => setWallet(Number(res?.data?.balance) || 0))
        .catch(() => setWallet(0));
    }

    return () => { mounted = false; };
  }, []);

  const handleConnect = async (astro) => {
    if (!isAuthed()) {
      alert("Please login to connect with an astrologer.");
      nav("/login");
      return;
    }

    if (!astro?.isOnline) {
      alert(`${astro?.displayName || "Astrologer"} is offline right now.`);
      return;
    }

    // Free (₹0/min) – connect directly (placeholder)
    if (Number(astro?.perMinuteRate) === 0) {
      alert(`Connecting free session with ${astro.displayName}...`);
      // TODO: start WebRTC free session here
      return;
    }

    // Paid – require at least 1 minute balance
    const perMin = Number(astro?.perMinuteRate) || 0;
    if (wallet >= perMin) {
      try {
        const res = await api.post("/bookings", {
          astrologerId: astro._id,
          type: "call",
          minutes: 1, // charge first minute upfront
        });

        if (res?.data) {
          alert(`Starting paid session with ${astro.displayName}`);
          // Optimistically deduct one minute
          setWallet(prev => Math.max(0, prev - perMin));
          // TODO: start call session (WebRTC + session timer)
        }
      } catch (err) {
        console.error("Booking error:", err?.response?.data || err.message);
        alert("Failed to create booking. Please try again.");
      }
    } else {
      if (window.confirm("Not enough balance. Add money to wallet?")) {
        nav("/wallet");
      }
    }
  };

  return (
    <div className="container">
      <header>
        <h2>🔯 Astrotalk</h2>
        <div>
          {isAuthed() ? (
            <>
              <span style={{ marginRight: 12 }}>
                Hi, {user?.username} ({user?.role})
              </span>
              <span className="wallet">💰 Wallet: ₹{wallet}</span>
              <button
                className="btn"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  if (user?.role === "astrologer") nav("/dashboard/astrologer");
                  else nav("/dashboard/user");
                }}
              >
                Dashboard
              </button>
              <button
                className="btn"
                style={{ marginLeft: 8 }}
                onClick={() => logout(nav)}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/signup" className="btn secondary" style={{ marginLeft: 8 }}>
                Signup
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="card">
        <h3>Available Astrologers</h3>

        {loading && <p>Loading astrologers…</p>}

        {!loading && astrologers.length === 0 && (
          <p>No astrologers are online right now.</p>
        )}

        <div className="astro-list">
          {astrologers.map((astro) => (
            <div key={astro._id} className="astro-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0 }}>{astro.displayName}</h4>
                <span
                  className="tag"
                  style={{
                    background: astro.perMinuteRate === 0 ? "#10b98133" : "#3b82f633",
                    borderRadius: 8,
                    padding: "2px 8px",
                    fontSize: 12
                  }}
                >
                  {astro.perMinuteRate === 0 ? "Free" : "Online"}
                </span>
              </div>

              {astro.bio && <p style={{ marginTop: 6 }}>{astro.bio}</p>}
              <p><b>Expertise:</b> {astro.expertise?.join(", ") || "—"}</p>
              <p><b>Languages:</b> {astro.languages?.join(", ") || "—"}</p>
              <p><b>Rate:</b> ₹{astro.perMinuteRate}/min</p>

              <button
                className="btn"
                onClick={() => handleConnect(astro)}
                disabled={!astro.isOnline}
                title={!astro.isOnline ? "Astrologer is offline" : "Connect now"}
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}
