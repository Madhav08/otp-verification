import { db } from "@/app/lib/firebase";
import { NextResponse } from "next/server";

const OTP_EXPIRY_MINUTES = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { message: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const docRef = db.collection("otp_verifications").doc(phone);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "No OTP found for this phone number" },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    const storedOtp = data?.otp;
    const createdAt = data?.createdAt?.toDate?.();

    // Check if OTP matches
    if (storedOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    // Check expiry
    const now = new Date();
    const diffMinutes = createdAt
      ? (now.getTime() - createdAt.getTime()) / (1000 * 60)
      : Infinity;

    if (diffMinutes > OTP_EXPIRY_MINUTES) {
      return NextResponse.json({ message: "OTP expired" }, { status: 410 });
    }

    // Mark OTP as verified
    await docRef.update({ verified: true });

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
