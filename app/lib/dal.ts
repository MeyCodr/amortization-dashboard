import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const getCurrentSession = cache(async (): Promise<SessionPayload | null> => {
  return getSession();
});
