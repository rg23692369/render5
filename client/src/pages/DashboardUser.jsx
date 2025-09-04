import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getUser } from "../lib/auth";

export default function DashboardUser() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [booking, setBooking] = useState({
    astrologerId: "",
    type: "call",
    minutes: 10,
  });

  const nav = useNavigate();
  const user = getUser();

  // 🔒 Role protection: only allow role=user
  useEffect(() => {
    if (!user) {
      nav("/login"); // not logged in
    } else if (user.role !== "user") {
      nav("/"); // wrong role → redirect to home (or astrologer dashboard)
    }
  }, [user, nav]);

  // Fetch astrologers on load
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/astrologers");
        setList(data.filter((a) => a.isOnline));
      } catch (e) {
        setErr(e?.response?.data?.error || e.message);
      }
    })();
  }, []);

  // Booking + payment handler
  const createBooking = async () => {
    try {
      const { data } = await api.post("/bookings", booking);
      const order = data.order;

      if (order?.testMode) {
        alert("Dummy booking created. Booking ID: " + data.booking._id);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Astrotalk",
        description: `Booking ${data.booking._id}`,
        order_id: order.id,
        handler: async function (response) {
          await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          alert("Payment successful! Booking confirmed. ID: " + data.booking._id);
        },
        theme: { color: "#3b82f6" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div className="container">
      <h3>User Dashboard</h3>
      {err && <p style={{ color: "#ff6b6b" }}>{err}</p>}

      {/* Booking Form */}
      <div className="card" style={{ marginBottom: 16 }}>
        <label>Choose Online Astrologer</label>
        <select
          className="input"
          value={booking.astrologerId}
          onChange={(e) =>
            setBooking({ ...booking, astrologerId: e.target.value })
          }
        >
          <option value="">-- select --</option>
          {list.map((a) => (
            <option key={a._id} value={a._id}>
              {a.displayName} • ₹{a.perMinuteRate}/min
            </option>
          ))}
        </select>

        <label>Type</label>
        <select
          className="input"
          value={booking.type}
          onChange={(e) => setBooking({ ...booking, type: e.target.value })}
        >
          <option value="call">Call</option>
          <option value="chat">Chat</option>
        </select>

        <label>Minutes</label>
        <input
          className="input"
          type="number"
          min="1"
          value={booking.minutes}
          onChange={(e) =>
            setBooking({ ...booking, minutes: Number(e.target.value) })
          }
        />

        <button
          className="btn"
          onClick={createBooking}
          disabled={!booking.astrologerId}
        >
          Pay & Book
        </button>
      </div>

      {/* Online Astrologers Grid */}
      <div className="grid">
        {list.length === 0 ? (
          <p>No astrologers are online right now.</p>
        ) : (
          list.map((a) => (
            <div className="card" key={a._id}>
              <h4>{a.displayName}</h4>
              <div style={{ marginBottom: 8 }}>
                {a.languages?.slice(0, 3).map((l) => (
                  <span className="tag" key={l}>
                    {l}
                  </span>
                ))}
                {a.expertise?.slice(0, 3).map((e) => (
                  <span className="tag" key={e}>
                    {e}
                  </span>
                ))}
              </div>
              <p>Rate: ₹{a.perMinuteRate}/min</p>
              <p style={{ color: "green", fontWeight: "bold" }}>Online</p>
              <button
                className="btn"
                onClick={() =>
                  setBooking({ astrologerId: a._id, type: "call", minutes: 10 })
                }
              >
                Book Call
              </button>
              <button
                className="btn secondary"
                style={{ marginLeft: 8 }}
                onClick={() =>
                  setBooking({ astrologerId: a._id, type: "chat", minutes: 10 })
                }
              >
                Book Chat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
