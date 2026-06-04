"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, RegisterState } from "../actions/auth";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register, undefined);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="mx-auto max-w-screen-xl px-8 pt-4 pb-8">
          <div className="flex items-center justify-between py-2 border-b border-white/10 mb-6">
            <span className="text-xs text-slate-400">Create a new account</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back to Sign In
            </Link>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">PHN Manufacturing</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Amortization Volume Tracker
            </h1>
            <p className="text-sm text-white mt-1.5">Request access to edit records</p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          {state?.success ? (
            /* ── Success state ── */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-emerald-50">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-sm font-extrabold text-emerald-900 tracking-tight">Registration submitted!</h2>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your account request has been sent to the admin for review. You will be able to sign in once your account is approved.
                </p>
                <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-amber-700">You cannot sign in until an admin approves your request.</span>
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 transition-colors"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* ── Registration form ── */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your account will need admin approval before you can sign in</p>
              </div>

              <form action={action} className="px-6 py-5 space-y-4">

                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={pending}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="Ahmad bin Ali"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Email Address
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
                    autoComplete="new-password"
                    required
                    minLength={6}
                    disabled={pending}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="min. 6 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    disabled={pending}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="re-enter your password"
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
                      Submitting…
                    </span>
                  ) : "Request Access"}
                </button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-8 py-4 flex items-center justify-between text-xs">
          <span className="text-gray-600">Amortization Volume Tracker · PHN Manufacturing</span>
          <span className="text-gray-600">{new Date().getFullYear()}</span>
        </div>
      </footer>

    </div>
  );
}
