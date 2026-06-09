"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";
import { sendPasswordResetEmail } from "../lib/email";

export type ForgotPasswordState = { error?: string; success?: boolean } | undefined;
export type ResetPasswordState = { error?: string; success?: boolean } | undefined;

export async function requestPasswordReset(
  state: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  if (!email) return { error: "Email address is required." };

  const user = await prisma.user.findUnique({ where: { email } });

  // Always show success — never reveal if an email exists
  if (!user || user.status !== "ACTIVE") return { success: true };

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/phnavt";
  const resetUrl = `${appUrl}${basePath}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch {
    return { error: "Failed to send reset email. Please try again or contact your admin." };
  }

  return { success: true };
}

export async function resetPassword(
  state: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = ((formData.get("token") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (!token) return { error: "Invalid or missing reset token." };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) return { error: "This reset link is invalid or has already been used." };
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return { error: "This reset link has expired. Please request a new one." };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.delete({ where: { token } }),
  ]);

  return { success: true };
}
