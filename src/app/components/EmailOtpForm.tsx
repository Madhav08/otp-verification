"use client";

import { useState, FormEvent } from "react";

type Props = {
  onResult: (result: { success: boolean; message: string; data?: any }) => void;
};

export default function EmailOtpForm({ onResult }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const safeJson = async (res: Response) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("Please enter a valid email.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await safeJson(res);
    setSent(res.ok);
    onResult({ success: res.ok, message: data.message, data: data.data });
    setLoading(false);
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp }),
    });

    const data = await safeJson(res);
    onResult({ success: res.ok, message: data.message, data: data.data });
    setLoading(false);

    if (res.ok) {
      // ✅ Auto-copy verified email
      try {
        await navigator.clipboard.writeText(email);
        alert(`${email} copied to clipboard!`);
      } catch {
        alert("Failed to copy email.");
      }

      setEmail("");
      setOtp("");
      setSent(false);
    }
  };

  return (
    <div>
      <h2>Email Verification</h2>
      {!sent ? (
        <form onSubmit={handleSend}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            disabled={loading}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Email OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            disabled={loading}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email OTP"}
          </button>
        </form>
      )}
    </div>
  );
}
