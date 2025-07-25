"use client";

import { useState } from "react";
import PhoneOtpForm from "./components/PhoneOtpForm";
import EmailOtpForm from "./components/EmailOtpForm";
import styles from "./styles/mainpage.module.css";
import Image from "next/image";
import logo from "./images/Sixt_Logo.svg";

type ResultType = {
  success: boolean;
  message: string;
  data?: unknown;
};

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [result, setResult] = useState<ResultType | null>(null);

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
      </div>
    </div>
  );
}
