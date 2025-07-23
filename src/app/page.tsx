"use client";

import { useState, FormEvent } from "react";

type Result = {
  success: boolean;
  message: string;
  data?: any;
};

export default function Home() {
  const [numbers, setNumbers] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const safeJson = async (res: Response) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${text} copied to clipboard!`);
    } catch {
      alert("Failed to copy to clipboard.");
    }
  };

  const handleSendSMS = async (e: FormEvent) => {
    e.preventDefault();

    const numbersArray = numbers
      .split(",")
      .map((num) => num.trim())
      .filter((num) => num.startsWith("+61"));

    if (numbersArray.length === 0) {
      alert("Please enter at least one valid number starting with +61");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numbers: numbersArray }),
      });

      const data = await safeJson(res);

      if (res.ok) {
        setResult({ success: true, message: data.message, data: data.data });
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }

    setLoading(false);
  };

  const handleVerifySMS = async (e: FormEvent) => {
    e.preventDefault();

    const phone = numbers.split(",")[0]?.trim();

    if (!phone || !otp) {
      alert("Please enter phone number and OTP to verify.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await safeJson(res);

      if (res.ok) {
        setResult({ success: true, message: data.message, data: data.data });
        if (data.data?.phone) {
          copyToClipboard(data.data.phone);
        }
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }

    setLoading(false);
  };

  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter an email address.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await safeJson(res);

      if (res.ok) {
        setResult({ success: true, message: data.message, data: data.data });
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }

    setLoading(false);
  };

  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !emailOtp) {
      alert("Please enter email and OTP.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: emailOtp }),
      });

      const data = await safeJson(res);

      if (res.ok) {
        setResult({ success: true, message: data.message, data: data.data });
        if (email) {
          copyToClipboard(data.data.phone);
        }
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>SMS OTP Verification</h1>
      <form onSubmit={handleSendSMS}>
        <label htmlFor="numbers">
          Phone Numbers (comma separated, start with +61):
        </label>
        <br />
        <input
          id="numbers"
          type="text"
          style={{ width: "100%", marginBottom: "1rem" }}
          value={numbers}
          onChange={(e) => setNumbers(e.target.value)}
          placeholder="+61400000000, +61400000001"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send SMS OTP"}
        </button>
      </form>

      <form onSubmit={handleVerifySMS}>
        <h2>Verify SMS OTP</h2>
        <input
          type="text"
          style={{ width: "100%", marginBottom: "1rem" }}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter SMS OTP"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify SMS"}
        </button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h1>Email OTP Verification</h1>
      <form onSubmit={handleSendEmail}>
        <input
          type="email"
          style={{ width: "100%", marginBottom: "1rem" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email OTP"}
        </button>
      </form>

      <form onSubmit={handleVerifyEmail}>
        <h2>Verify Email OTP</h2>
        <input
          type="text"
          style={{ width: "100%", marginBottom: "1rem" }}
          value={emailOtp}
          onChange={(e) => setEmailOtp(e.target.value)}
          placeholder="Enter Email OTP"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      {result && (
        <div
          style={{ marginTop: "1rem", color: result.success ? "green" : "red" }}
        >
          <strong>{result.success ? "Success:" : "Error:"}</strong>{" "}
          {result.message}
          {result.success && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
