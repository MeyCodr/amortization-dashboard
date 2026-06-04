"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, LoginState } from "../actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Hero banner — identical language to dashboard ── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="mx-auto max-w-screen-xl px-8 pt-4 pb-8">

          {/* top bar */}
          <div className="flex items-center justify-between py-2 border-b border-white/10 mb-6">
            <span className="text-xs text-slate-400">Sign in to your workspace</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">PHN Manufacturing</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Amortization Volume Tracker
            </h1>
            <p className="text-sm text-white mt-1.5">Sign in to add or edit records</p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          {/* Same card pattern as dashboard panels */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">Sign In</h2>
              <p className="text-xs text-gray-500 mt-0.5">Enter your credentials to continue</p>
            </div>

            {/* Form body */}
            <form action={action} className="px-6 py-5 space-y-4">

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={pending}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                  placeholder="you@phn.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={pending}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>

              {state?.error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-600">{state.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 transition-colors cursor-pointer"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign In"}
              </button>

            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Request access
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-2">
            No account needed to view data —{" "}
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              browse as guest
            </Link>
          </p>

        </div>
      </main>

      {/* ── Footer — identical to dashboard ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-8 py-4 flex items-center justify-between text-xs">
          <span className="text-gray-600">Amortization Volume Tracker · PHN Manufacturing</span>
          <span className="text-gray-600">{new Date().getFullYear()}</span>
        </div>
      </footer>

    </div>
  );
}
