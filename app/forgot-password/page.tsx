import ForgotPasswordForm from "./ForgotPasswordForm";

// Force dynamic rendering so the per-request CSP nonce can be applied.
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
