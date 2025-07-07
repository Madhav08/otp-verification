import { storeOtp } from "@/app/lib/otp-store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  try {
    const body = await request.json();
    const { numbers } = body;

    const OTP = generateOtp();

    const sms_text = `Your OTP is ${OTP}`;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json(
        { message: "sms_text and numbers are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://cellcast.com.au/api/v3/send-sms", {
      method: "POST",
      headers: {
        APPKEY: "CELLCAST48ebc31777f8e72ca89ad7bd00ab3892", // your key
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ sms_text, numbers }),
    });

    const responseText = await response.text();

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON from SMS provider", raw: responseText },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.msg || "Error sending SMS", data, raw: responseText },
        { status: response.status }
      );
    }

    storeOtp(numbers[0], OTP);

    return NextResponse.json({ message: "SMS sent successfully", data });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
