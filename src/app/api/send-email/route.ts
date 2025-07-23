import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import { db } from "@/app/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required and must be a string." },
        { status: 400 }
      );
    }

    const otp = randomInt(100000, 999999).toString();

    await db
      .collection("otp_email")
      .doc(email)
      .set({
        otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PAH Verification" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Email Verification Code",
      text: `Your OTP is: ${otp}`,
    });

    return NextResponse.json({
      message: "OTP sent to email successfully.",
      data: { email },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        {
          message: "Failed to send email.",
          error: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json(
        {
          message: "Failed to send email.",
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }
}
