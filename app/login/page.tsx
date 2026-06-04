import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/dal";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session?.userId) redirect("/");

  return <LoginForm />;
}
