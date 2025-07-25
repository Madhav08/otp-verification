"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Input from "./Input";
import Button from "./Button";
import styles from "../styles/mainpage.module.css";

type Props = {
  onResult: (result: { success: boolean; message: string; data?: any }) => void;
};

export default function EmailOtpForm({ onResult }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>("");
  const [messageColor, setMessageColor] = useState<string>("#ff5f00");
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message) {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setMessage(null);
      }, 60000); // Clear after 1 minutes seconds
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

  const handleResend = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setMessage("Please enter a valid email before resending OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
      onResult({ success: res.ok, message: data.message, data: data.data });
    } catch (error) {
      setMessage("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setOtp("");
    setSent(false);
    setLoading(false);
    setMessage(null);
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
      setMessageColor("green");
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
    <div className={styles.formContainer}>
      <h2>Email Verification</h2>

      {!sent ? (
        <form onSubmit={handleSend} className={styles.layoutForm}>
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={handleEmailChange}
            type="email"
            id="emailMain"
          />
          <Button
            btnText={loading ? "Sending..." : "Send OTP to Email"}
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
            id="emailOTP"
          />
          <Button
            btnText={loading ? "Verifying..." : "Verify Email OTP"}
            disabled={loading}
            type="submit"
          />
        </form>
      )}

      {message && (
        <div
          style={{
            margin: "1rem 0",
            color: `${messageColor}`,
            fontWeight: 500,
            maxWidth: "430px",
            overflowWrap: "break-word",
          }}
        >
          {message}
          {" | "}
          <button
            onClick={handleResend}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#0070f3",
              textDecoration: "underline",
              cursor: loading ? "not-allowed" : "pointer",
              padding: 0,
              fontWeight: "bold",
            }}
          >
            Resend
          </button>
          {" | "}
          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#0070f3",
              textDecoration: "underline",
              cursor: loading ? "not-allowed" : "pointer",
              padding: 0,
              fontWeight: "bold",
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
