import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/dal";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const session = await getCurrentSession();
  if (session?.userId) redirect("/");

  return <RegisterForm />;
}
