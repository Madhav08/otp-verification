"use client";

import { useState } from "react";

export default function HomePage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const sendOtp = async () => {
    setMessage("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await res.json();
    if (data.success) {
      setStep(2);
    } else {
      setMessage(data.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, otp }),
    });

    const data = await res.json();
    if (data.verified) {
      setMessage("✅ Phone number verified!");
    } else {
      setMessage(data.message || "❌ Invalid OTP");
    }
  };

  return (
    <main
      style={{ maxWidth: 400, margin: "50px auto", fontFamily: "sans-serif" }}
    >
      <h1>Phone Verification</h1>

      {step === 1 && (
        <>
          <label>Phone Number:</label>
          <input
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <label>Enter OTP:</label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <button onClick={verifyOtp}>Verify</button>
        </>
      )}

      {message && <p>{message}</p>}
    </main>
  );
}
