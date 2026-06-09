"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, RegisterState } from "../actions/auth";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register, undefined);

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12">

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Decorative glows */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Top logo mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">PHN Manufacturing</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Request<br />
              <span className="text-blue-400">Access</span>
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              New accounts are reviewed and approved by an IT admin before access is granted.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4">
            {[
              { step: "01", label: "Fill in your details", desc: "Name, email, and a secure password" },
              { step: "02", label: "Submit your request", desc: "Your request is sent to the admin" },
              { step: "03", label: "Get approved & sign in", desc: "You'll be able to log in once approved" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-blue-400">{s.step}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{s.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[10px] text-slate-600">© {new Date().getFullYear()} PHN Manufacturing. Internal use only.</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 mb-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">PHN Manufacturing</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-800">Request Access</h2>
        </div>

        <div className="w-full max-w-sm">

          {state?.success ? (
            /* ── Success state ── */
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500" />
              <div className="px-8 py-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Request submitted!</h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Your account request has been sent to the admin for review. You can sign in once it&apos;s approved.
                </p>

                <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-3 text-left">
                  <svg className="w-4 h-4 text-amber-500 mt-px shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-amber-700">Sign-in is only available after admin approval.</span>
                </div>

                <Link
                  href="/login"
                  className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition-all shadow-sm shadow-blue-200"
                >
                  Go to Sign In
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            /* ── Registration form ── */
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

              <div className="px-8 pt-7 pb-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Create account</h2>
                <p className="text-xs text-slate-400 mt-1">Requires admin approval before you can sign in</p>
              </div>

              <form action={action} className="px-8 py-6 space-y-4">

                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      disabled={pending}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                      placeholder="Ahmad bin Ali"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={pending}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                      placeholder="you@phn.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      disabled={pending}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                      placeholder="min. 6 characters"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      disabled={pending}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                      placeholder="re-enter your password"
                    />
                  </div>
                </div>

                {state?.error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
                    <svg className="w-4 h-4 mt-px shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-red-600 font-medium">{state.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 transition-all shadow-sm shadow-blue-200 cursor-pointer mt-1"
                >
                  {pending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Request Access
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>

              </form>

              <div className="px-8 pb-7">
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-center text-xs text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-[10px] text-slate-400">Secured · Internal use only</span>
          </div>

        </div>
      </div>

    </div>
  );
}
