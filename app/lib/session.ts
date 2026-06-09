import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  userId: number;
  name: string;
  role: "BD" | "PVD" | "IT" | "USER";
  expiresAt: Date;
};

const secretKey = process.env.SESSION_SECRET;
if (!secretKey || secretKey.length < 32) {
  throw new Error(
    "SESSION_SECRET environment variable is missing or too short (minimum 32 characters). " +
    "Set it in your .env file before starting the server."
  );
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Omit<SessionPayload, "expiresAt"> & { expiresAt: Date }) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined = ""): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(data: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const token = await encrypt({ ...data, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  return decrypt(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
