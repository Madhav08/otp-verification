"use client";

import { useState, FormEvent } from "react";

type Result = {
  success: boolean;
  message: string;
  data?: any;
};

export default function Home() {
  const [numbers, setNumbers] = useState("");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
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
        body: JSON.stringify({
          numbers: numbersArray,
        }),
      });

      const data = await res.json();

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

  const handleVerify = async (e: FormEvent) => {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

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

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Send SMS via Cellcast API</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="numbers">
            Phone Numbers (comma separated, start with +61):
          </label>
          <br />
          <input
            id="numbers"
            type="text"
            style={{ width: "100%" }}
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            placeholder="+61400000000, +61400000001"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send SMS"}
        </button>
      </form>

      <h1>VERIFY OTP for {numbers.split(",")[0]?.trim() || "phone number"}</h1>
      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="otp">Enter OTP:</label>
          <br />
          <input
            id="otp"
            type="text"
            style={{ width: "100%" }}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
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
