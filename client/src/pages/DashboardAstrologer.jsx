import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getUser } from "../lib/auth";

export default function DashboardAstrologer() {
  const [bookings, setBookings] = useState([]);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      nav("/login", { replace: true });
    } else if (user.role !== "astrologer") {
      nav("/dashboard/user", { replace: true });
    }
  }, [user, nav]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/bookings/me");
        setBookings(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Network Error");
      }
    })();
  }, []);

  return (
    <div className="container">
      <h3>Astrologer Dashboard</h3>
      {err && <p style={{ color: "#ff6b6b" }}>{err}</p>}
      <div className="card" style={{ marginBottom: 16 }}>
        <p>Welcome, <b>{user?.username}</b> 👋</p>
        <p>Here you can see your upcoming bookings and manage sessions.</p>
      </div>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="grid">
          {bookings.map((b) => (
            <div className="card" key={b._id}>
              <h4>Booking #{(b._id || "").slice(-6)} ({b.type})</h4>
              <p><b>User:</b> {b.user?.username || "--"}</p>
              <p><b>Minutes:</b> {b.minutes}</p>
              <p><b>Status:</b> <span style={{ fontWeight: "bold", color: b.status === "confirmed" ? "green" : "orange" }}>{b.status}</span></p>
              <p><b>Created:</b> {b.createdAt ? new Date(b.createdAt).toLocaleString() : "--"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
