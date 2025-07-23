"use client";

import { useState } from "react";
import PhoneOtpForm from "./components/PhoneOtpForm";
import EmailOtpForm from "./components/EmailOtpForm";
import ResultMessage from "./components/ResultMessage";

export default function Home() {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <PhoneOtpForm onResult={setResult} />
      <hr style={{ margin: "2rem 0" }} />
      <EmailOtpForm onResult={setResult} />
      <ResultMessage result={result} />
    </div>
  );
}
