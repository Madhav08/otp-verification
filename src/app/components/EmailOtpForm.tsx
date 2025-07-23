"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Input from "./Input";
import Button from "./Button";

type Props = {
  onResult: (result: { success: boolean; message: string; data?: any }) => void;
};

export default function EmailOtpForm({ onResult }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clears message when user starts typing a new email
  useEffect(() => {
    if (message) {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setMessage(null);
      }, 5000); // Clear after 5 seconds
    }

    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, [message]);

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
      setMessage("Please enter a valid email.");
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
    setMessage(data.message);
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
      setMessage(`${email} verified and copied to clipboard!`);
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        setMessage("Verified but failed to copy email.");
      }

      setEmail("");
      setOtp("");
      setSent(false);
    } else {
      setMessage(data.message || "Verification failed.");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (message) setMessage(null);
  };

  return (
    <div>
      <h2>Email Verification</h2>

      {message && (
        <div style={{ margin: "1rem 0", color: "#ff5f00", fontWeight: 500 }}>
          {message}
        </div>
      )}

      {!sent ? (
        <form onSubmit={handleSend}>
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={handleEmailChange}
            type="email"
          />
          <Button
            btnText={loading ? "Sending..." : "Send Email OTP"}
            disabled={loading}
            type="submit"
          />
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            type="number"
          />
          <Button
            btnText={loading ? "Verifying..." : "Verify Email OTP"}
            disabled={loading}
            type="submit"
          />
        </form>
      )}
    </div>
  );
}
