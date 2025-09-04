import React, { useEffect, useRef, useState } from "react";
import api from "../lib/api";

// Simple two-way audio chat:
// - SpeechRecognition (browser) to capture voice → text
// - Send text to backend /api/ai/chat
// - Speak AI reply via speechSynthesis
// Falls back gracefully if SpeechRecognition unavailable.

const getRecognition = () => {
  const w = window;
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
};

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const recRef = useRef(null);

  useEffect(() => {
    recRef.current = getRecognition();
    if (recRef.current) {
      recRef.current.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setTranscript(t);
        (async () => {
          try {
            const { data } = await api.post("/ai/chat", { message: t });
            const text = data?.reply || "I couldn't generate a response.";
            setReply(text);
            // Speak it
            if ("speechSynthesis" in window) {
              const uttr = new SpeechSynthesisUtterance(text);
              window.speechSynthesis.speak(uttr);
            }
          } catch (err) {
            setReply(err?.response?.data?.error || err.message || "Network error.");
          }
        })();
      };
      recRef.current.onerror = () => setListening(false);
      recRef.current.onend = () => setListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (!recRef.current) { alert("SpeechRecognition not supported in this browser."); return; }
    if (listening) {
      try { recRef.current.stop(); } catch {}
    } else {
      setTranscript(""); setReply("");
      try { recRef.current.start(); setListening(true); } catch {}
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          cursor: "pointer",
          fontSize: 22
        }}
        className="btn"
        aria-label="AI Voice Assistant"
        title="AI Voice Assistant"
      >
        🎙️
      </button>

      {/* Panel */}
      {open && (
        <div
          className="card"
          style={{
            position: "fixed",
            bottom: 88,
            right: 20,
            width: 320,
            maxWidth: "90vw",
            zIndex: 1000
          }}
        >
          <h4 style={{ marginTop: 0 }}>AI Audio Assistant</h4>
          <p style={{ margin: 0, color: "#666" }}>Click the mic and speak. I’ll reply with voice.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={toggleListen}>
              {listening ? "Stop" : "Start"} Talking
            </button>
          </div>
          {transcript && (
            <div style={{ marginTop: 12 }}>
              <b>You:</b> {transcript}
            </div>
          )}
          {reply && (
            <div style={{ marginTop: 8 }}>
              <b>Assistant:</b> {reply}
            </div>
          )}
        </div>
      )}
    </>
  );
}
