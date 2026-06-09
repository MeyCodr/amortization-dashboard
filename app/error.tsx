"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-slate-300">500</p>
        <h1 className="mt-4 text-xl font-extrabold text-slate-800">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">An unexpected error occurred. Please try again.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
