"use client";

import { useState } from "react";
import PhoneOtpForm from "./components/PhoneOtpForm";
import EmailOtpForm from "./components/EmailOtpForm";
import ResultMessage from "./components/ResultMessage";
import styles from "./styles/mainpage.module.css";
import Image from "next/image";
import logo from "./images/Sixt_Logo.svg";

export default function Home() {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  return (
    <div>
      <Image
        src={logo}
        width={100}
        height={100}
        alt="SIXT Logo"
        className={styles.logo}
      />
      <div className={styles.layoutMain}>
        <PhoneOtpForm onResult={setResult} />
        <hr style={{ height: "300px" }} />
        <EmailOtpForm onResult={setResult} />
        {/* <ResultMessage result={result} /> */}
      </div>
    </div>
  );
}
