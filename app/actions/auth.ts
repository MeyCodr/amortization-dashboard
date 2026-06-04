"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";
import { createSession, deleteSession } from "../lib/session";

export type LoginState = { error?: string } | undefined;

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) return { error: "Email and password are required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password." };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password." };

  if (user.status === "PENDING") {
    return { error: "Your account is pending admin approval. Please check back later." };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    role: user.role as "BD" | "PVD" | "IT" | "USER",
  });

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export type RegisterState = { error?: string; success?: boolean } | undefined;

export async function register(state: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (!name || !email || !password) return { error: "All fields are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashed, role: "USER", status: "PENDING" },
  });

  return { success: true };
}
