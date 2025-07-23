"use client";

import { useState, FormEvent } from "react";

type Props = {
  onResult: (result: { success: boolean; message: string; data?: any }) => void;
};

export default function PhoneOtpForm({ onResult }: Props) {
  const [phone, setPhone] = useState("");
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
    const formatted = phone.trim().replace(/^0/, "").replace(/\s+/g, "");
    if (!formatted.match(/^\d{9}$/)) {
      alert("Please enter a valid 9-digit Australian mobile number.");
      return;
    }

    const fullNumber = `+61${formatted}`;
    setLoading(true);

    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers: [fullNumber] }),
    });

    const data = await safeJson(res);
    setSent(res.ok);
    onResult({ success: res.ok, message: data.message, data: data.data });
    setLoading(false);
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const fullNumber = `+61${phone
      .trim()
      .replace(/^0/, "")
      .replace(/\s+/g, "")}`;
    setLoading(true);

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullNumber, otp }),
    });

    const data = await safeJson(res);
    onResult({ success: res.ok, message: data.message, data: data.data });
    setLoading(false);

    if (res.ok) {
      // ✅ Auto-copy verified phone number
      try {
        await navigator.clipboard.writeText(fullNumber);
        alert(`${fullNumber} copied to clipboard!`);
      } catch {
        alert("Failed to copy phone number.");
      }

      setPhone("");
      setOtp("");
      setSent(false);
    }
  };

  return (
    <div>
      <h2>Phone Verification</h2>
      {!sent ? (
        <form onSubmit={handleSend}>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone (e.g. 400000000)"
            disabled={loading}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
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
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
    </div>
  );
}
