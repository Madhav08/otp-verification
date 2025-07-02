"use client";

import { useState } from "react";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function sendOtp() {
    setMessage("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone }),
    });
    const data = await res.json();
    if (data.success) setMessage("OTP sent successfully!");
    else setMessage(`Error: ${data.message}`);
  }

  async function verifyOtp() {
    setMessage("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, otp }),
    });
    const data = await res.json();
    if (data.verified) setMessage("OTP verified successfully!");
    else setMessage(`Error: ${data.message}`);
  }

  return (
    <main style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h1>Phone OTP Verification</h1>

      <input
        type="text"
        placeholder="+1234567890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={sendOtp} style={{ width: "100%", marginBottom: 20 }}>
        Send OTP
      </button>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={verifyOtp} style={{ width: "100%" }}>
        Verify OTP
      </button>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </main>
  );
}
