import Link from "next/link";

// Force dynamic rendering so the per-request CSP nonce can be applied.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-slate-300">404</p>
        <h1 className="mt-4 text-xl font-extrabold text-slate-800">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
