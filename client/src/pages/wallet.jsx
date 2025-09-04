import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { isAuthed } from "../lib/auth";

export default function Wallet() {
  const nav = useNavigate();
  const [amount, setAmount] = useState("");

  const handleAddMoney = async () => {
    if (!isAuthed()) {
      alert("Please login first!");
      nav("/login");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const res = await api.post("/wallet/add", { amount: Number(amount) });
      alert(`₹${amount} added! New balance: ₹${res.data.balance}`);
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("Failed to add money. Try again.");
    }
  };

  return (
    <div className="container">
      <h2>💰 Recharge Wallet</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input"
      />
      <button className="btn" onClick={handleAddMoney}>Add Money</button>
    </div>
  );
}
