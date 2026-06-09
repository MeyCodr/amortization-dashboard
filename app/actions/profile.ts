"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "../lib/db";
import { verifySession } from "../lib/dal";

export type ProfileState = { error?: string; success?: string } | undefined;

export async function updateProfile(state: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await verifySession();

  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };

  const conflict = await prisma.user.findFirst({
    where: { email, NOT: { id: session.userId } },
  });
  if (conflict) return { error: "That email is already used by another account." };

  await prisma.user.update({
    where: { id: session.userId },
    data: { name, email },
  });

  revalidatePath("/");
  return { success: "Profile updated successfully." };
}

export async function changePassword(state: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await verifySession();

  const current = (formData.get("currentPassword") as string) ?? "";
  const next = (formData.get("newPassword") as string) ?? "";
  const confirm = (formData.get("confirmPassword") as string) ?? "";

  if (!current || !next) return { error: "All fields are required." };
  if (next.length < 6) return { error: "New password must be at least 6 characters." };
  if (next !== confirm) return { error: "Passwords do not match." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "User not found." };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: session.userId }, data: { password: hashed } });

  return { success: "Password changed successfully." };
}
