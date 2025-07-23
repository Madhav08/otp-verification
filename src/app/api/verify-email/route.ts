import { db } from "@/app/lib/firebase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    const doc = await db.collection("otp_email").doc(email).get();

    if (!doc.exists) {
      return NextResponse.json({ message: "No OTP found." }, { status: 400 });
    }

    const data = doc.data();

    if (!data) {
      return NextResponse.json(
        { message: "Invalid OTP data." },
        { status: 400 }
      );
    }

    if (data.expiresAt < Date.now()) {
      return NextResponse.json({ message: "OTP expired." }, { status: 400 });
    }

    if (data.otp !== code) {
      return NextResponse.json({ message: "Incorrect OTP." }, { status: 400 });
    }

    await db.collection("otp_email").doc(email).delete();

    return NextResponse.json({
      message: "Email verified successfully",
      data: { email },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Verify Email OTP error:", error);
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unknown error verifying Email OTP:", error);
      return NextResponse.json(
        { message: "Internal server error", error: "Unknown error" },
        { status: 500 }
      );
    }
  }
}

// Optional: handle GET to avoid HTML page on GET request
export async function GET() {
  return NextResponse.json(
    { message: "GET method not supported on this endpoint." },
    { status: 405 }
  );
}
