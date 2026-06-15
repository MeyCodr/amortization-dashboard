"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateProfile, changePassword, ProfileState } from "../actions/profile";

const ROLE_META: Record<string, { label: string; color: string; desc: string }> = {
  IT:   { label: "IT",   color: "bg-purple-100 text-purple-800 border-purple-200", desc: "Full access" },
  BD:   { label: "BD",   color: "bg-blue-100 text-blue-800 border-blue-200",       desc: "Customer records only" },
  PVD:  { label: "PVD",  color: "bg-amber-100 text-amber-800 border-amber-200",    desc: "Vendor records only" },
  USER: { label: "User", color: "bg-gray-100 text-gray-700 border-gray-200",       desc: "View only" },
};

type User = { id: number; name: string; email: string; role: string };

function Alert({ state }: { state: ProfileState }) {
  if (!state?.error && !state?.success) return null;
  const isError = !!state.error;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-xs font-medium ${
      isError
        ? "bg-red-50 border border-red-100 text-red-600"
        : "bg-emerald-50 border border-emerald-100 text-emerald-700"
    }`}>
      {isError ? (
        <svg className="w-4 h-4 mt-px shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mt-px shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      )}
      {state.error ?? state.success}
    </div>
  );
}

export default function ProfileClient({ user }: { user: User }) {
  const [infoState, infoAction, infoPending] = useActionState<ProfileState, FormData>(updateProfile, undefined);
  const [pwState, pwAction, pwPending] = useActionState<ProfileState, FormData>(changePassword, undefined);

  const role = ROLE_META[user.role] ?? ROLE_META.USER;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="w-full px-4 py-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                user.role === "IT"  ? "bg-purple-500/20 text-purple-200 border-purple-400/40" :
                user.role === "BD"  ? "bg-blue-500/20 text-blue-200 border-blue-400/40" :
                user.role === "PVD" ? "bg-amber-500/20 text-amber-200 border-amber-400/40" :
                "bg-white/10 text-slate-300 border-white/20"
              }`}>{role.label}</span>
              <span className="text-sm font-semibold text-white">{user.name}</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">PHN Manufacturing</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">My Profile</h1>
            <p className="text-sm text-slate-300 mt-1">Manage your account details and password</p>
          </div>
        </div>
      </div>

      <main className="w-full px-4 py-8 space-y-6">

        {/* Account info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-gray-900">Account Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update your display name and email address</p>
          </div>
          <form action={infoAction} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={user.name}
                  disabled={infoPending}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={user.email}
                  disabled={infoPending}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Role</label>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded border ${role.color}`}>
                  {role.label}
                </span>
                <span className="text-xs text-gray-500">{role.desc}</span>
                <span className="text-[10px] text-gray-400 ml-1">— contact IT to change</span>
              </div>
            </div>

            <Alert state={infoState} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={infoPending}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {infoPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-500 mt-0.5">You must confirm your current password before setting a new one</p>
          </div>
          <form action={pwAction} className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                disabled={pwPending}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                placeholder="Enter your current password"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  disabled={pwPending}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                  placeholder="min. 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  disabled={pwPending}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <Alert state={pwState} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pwPending}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {pwPending ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}
