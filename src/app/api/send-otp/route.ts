// src/app/api/send-otp/route.ts
import otpStore from "@/app/lib/otp-store";
import { NextResponse } from "next/server";
import { Twilio } from "twilio";

export async function POST(request: Request) {
  const { phoneNumber } = await request.json();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phoneNumber, otp);
  setTimeout(() => otpStore.delete(phoneNumber), 5 * 60 * 1000); // expire in 5 mins

  const client = new Twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phoneNumber,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Unknown error" },
      { status: 500 }
    );
  }
}
