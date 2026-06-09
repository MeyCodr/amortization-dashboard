"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";
import { verifySession } from "../lib/dal";
import { sendAccountApprovedEmail } from "../lib/email";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
};

export async function getUsers(): Promise<UserRow[]> {
  const session = await verifySession();
  if (session.role !== "IT") throw new Error("Forbidden");
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
}

export type UserFormState = { error?: string; success?: boolean } | undefined;

const VALID_ROLES = ["BD", "PVD", "IT", "USER"];

export async function createUser(state: UserFormState, formData: FormData): Promise<UserFormState> {
  const session = await verifySession();
  if (session.role !== "IT") return { error: "Forbidden" };

  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  const role = (formData.get("role") as string) ?? "";

  if (!name || !email || !password || !role) return { error: "All fields are required." };
  if (!VALID_ROLES.includes(role)) return { error: "Invalid role." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use." };

  const hashed = await bcrypt.hash(password, 10);
  // Admin-created users are immediately active
  await prisma.user.create({
    data: { name, email, password: hashed, role: role as "BD" | "PVD" | "IT" | "USER", status: "ACTIVE" },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  const session = await verifySession();
  if (session.role !== "IT") throw new Error("Forbidden");
  if (!VALID_ROLES.includes(role)) throw new Error("Invalid role.");
  await prisma.user.update({ where: { id: userId }, data: { role: role as "BD" | "PVD" | "IT" | "USER" } });
  revalidatePath("/admin");
}

export async function approveUser(userId: number, role: string): Promise<void> {
  const session = await verifySession();
  if (session.role !== "IT") throw new Error("Forbidden");
  if (!VALID_ROLES.includes(role)) throw new Error("Invalid role.");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE", role: role as "BD" | "PVD" | "IT" | "USER" },
  });
  revalidatePath("/admin");
  // Send approval notification — fire-and-forget, don't block the UI
  sendAccountApprovedEmail(user.email, user.name, role).catch(() => {});
}

export async function rejectUser(userId: number): Promise<void> {
  const session = await verifySession();
  if (session.role !== "IT") throw new Error("Forbidden");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
}

export async function deleteUser(userId: number): Promise<void> {
  const session = await verifySession();
  if (session.role !== "IT") throw new Error("Forbidden");
  if (session.userId === userId) throw new Error("You cannot delete your own account.");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
}

export async function updateUser(state: UserFormState, formData: FormData): Promise<UserFormState> {
  const session = await verifySession();
  if (session.role !== "IT") return { error: "Forbidden" };

  const userId = parseInt((formData.get("userId") as string) ?? "0");
  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();

  if (!userId) return { error: "Invalid user." };
  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };

  const existing = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
  if (existing) return { error: "Email is already in use by another account." };

  await prisma.user.update({ where: { id: userId }, data: { name, email } });
  revalidatePath("/admin");
  return { success: true };
}

export async function resetPassword(state: UserFormState, formData: FormData): Promise<UserFormState> {
  const session = await verifySession();
  if (session.role !== "IT") return { error: "Forbidden" };

  const userId = parseInt((formData.get("userId") as string) ?? "0");
  const password = (formData.get("password") as string) ?? "";

  if (!userId) return { error: "Invalid user." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found." };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { success: true };
}
