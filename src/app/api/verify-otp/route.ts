import { db } from "@/app/lib/firebase";
import { NextResponse } from "next/server";

function normalizePhoneNumber(number: string) {
  return number.trim(); // normalize if needed
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp } = await request.json();

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const doc = await db.collection("otps").doc(normalizedPhone).get();

    if (!doc.exists) {
      return NextResponse.json(
        { verified: false, message: "No OTP found" },
        { status: 400 }
      );
    }

    const data = doc.data();
    if (!data) {
      return NextResponse.json(
        { verified: false, message: "No OTP data" },
        { status: 400 }
      );
    }

    const storedOtp = data.otp;
    const createdAt = data.createdAt;

    const now = Date.now();
    const isExpired = now - createdAt > 5 * 60 * 1000; // 5 mins

    if (storedOtp === otp && !isExpired) {
      await db.collection("otps").doc(normalizedPhone).delete();
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json(
        { verified: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { verified: false, message: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
