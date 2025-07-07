import { db } from "./firebase";
import admin from "firebase-admin";

export async function storeOtp(phone: string, otp: string): Promise<void> {
  try {
    await db.collection("otp_verifications").doc(phone).set({
      otp,
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("OTP stored successfully.");
  } catch (error) {
    console.error("Error storing OTP:", error);
    throw error;
  }
}
