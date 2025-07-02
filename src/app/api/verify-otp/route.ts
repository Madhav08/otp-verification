// src/app/api/verify-otp/route.ts
import otpStore from "@/app/lib/otp-store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { phoneNumber, otp } = await request.json();
  const storedOtp = otpStore.get(phoneNumber);

  if (storedOtp === otp) {
    otpStore.delete(phoneNumber);
    return NextResponse.json({ verified: true });
  }

  return NextResponse.json(
    { verified: false, message: "Invalid OTP" },
    { status: 400 }
  );
}
