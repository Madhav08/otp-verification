"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Input from "./Input";
import Button from "./Button";
import styles from "../styles/mainpage.module.css";

type Props = {
  onResult: (result: { success: boolean; message: string; data?: any }) => void;
};

export default function PhoneOtpForm({ onResult }: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<string>("#ff5f00");
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-clear message after 1 minutes
  useEffect(() => {
    if (message) {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setMessage(null);
      }, 60000);
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
    const formatted = phone.trim().replace(/^0/, "").replace(/\s+/g, "");

    if (!formatted.match(/^\d{9}$/)) {
      setMessage("Please enter a valid 9-digit Australian mobile number.");
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
    setMessage(data.message);
    onResult({ success: res.ok, message: data.message, data: data.data });
    setLoading(false);
  };

  const handleResend = async () => {
    const formatted = phone.trim().replace(/^0/, "").replace(/\s+/g, "");
    if (!formatted.match(/^\d{9}$/)) {
      setMessage("Please enter a valid 9-digit Australian mobile number.");
      return;
    }

    const fullNumber = `+61${formatted}`;
    setLoading(true);

    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: [fullNumber] }),
      });

      const data = await safeJson(res);
      setMessage(data.message);
      onResult({ success: res.ok, message: data.message, data: data.data });
    } catch (error) {
      setMessage("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhone("");
    setOtp("");
    setSent(false);
    setLoading(false);
    setMessage(null);
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
      setMessage(`${fullNumber} verified and copied to clipboard!`);
      try {
        await navigator.clipboard.writeText(fullNumber);
      } catch {
        setMessage("Verified but failed to copy phone number.");
      }

      setPhone("");
      setOtp("");
      setSent(false);
    } else {
      setMessage(data.message || "Verification failed.");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (message) setMessage(null);
  };

  return (
    <div className={styles.formContainer}>
      <h2>Phone Verification</h2>

      {!sent ? (
        <form onSubmit={handleSend}>
          <Input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Enter phone (e.g. 400000000)"
            id="phoneMain"
          />

          <Button
            btnText={loading ? "Sending..." : "Send OTP to Phone"}
            disabled={loading}
            type="submit"
          />
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            id="phoneOTP"
          />
          <Button
            btnText={loading ? "Verifying..." : "Verify OTP"}
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
