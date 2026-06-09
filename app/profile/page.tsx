import { verifySession } from "../lib/dal";
import { prisma } from "../lib/db";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) return null;
  return <ProfileClient user={user} />;
}
