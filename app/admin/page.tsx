import { redirect } from "next/navigation";
import { verifySession } from "../lib/dal";
import { getUsers } from "../actions/users";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await verifySession();
  if (session.role !== "IT") redirect("/");

  const users = await getUsers();
  return <AdminClient users={users} currentUserId={session.userId} />;
}
