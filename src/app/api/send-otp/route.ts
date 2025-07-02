import { db } from "@/app/lib/firebase";
import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhone = process.env.TWILIO_PHONE_NUMBER!;
const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneNumber.replace(/\s+/g, "");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`Generated OTP ${otp} for ${normalizedPhone}`);

    // 1. Save OTP to Firestore
    await db.collection("otps").doc(normalizedPhone).set({
      otp,
      createdAt: Date.now(),
    });

    console.log("OTP saved to Firestore");

    // 2. Send OTP via Twilio
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: fromPhone,
      to: normalizedPhone,
    });

    console.log("OTP sent via Twilio, message SID:", message.sid);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending OTP:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to send OTP. Check logs for details." },
      { status: 500 }
    );
  }
}
