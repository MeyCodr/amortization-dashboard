"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUser,
  updateUser,
  updateUserRole,
  approveUser,
  rejectUser,
  deleteUser,
  resetPassword,
  UserFormState,
  UserRow,
} from "../actions/users";

const ROLES = ["IT", "BD", "PVD", "USER"] as const;

const ROLE_META: Record<string, { label: string; color: string; desc: string }> = {
  IT: { label: "IT", color: "bg-purple-100 text-purple-800 border-purple-200", desc: "Full access" },
  BD: { label: "BD", color: "bg-blue-100 text-blue-800 border-blue-200", desc: "Customer records only" },
  PVD: { label: "PVD", color: "bg-amber-100 text-amber-800 border-amber-200", desc: "Vendor records only" },
  USER: { label: "User", color: "bg-gray-100 text-gray-700 border-gray-200", desc: "View only" },
};

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] ?? ROLE_META.USER;
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded border ${m.color}`}>
      {m.label}
    </span>
  );
}

function fmt(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState<UserFormState, FormData>(createUser, undefined);

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state?.success, onSuccess]);

  if (state?.success) return null;

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            name="name"
            required
            disabled={pending}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="Ahmad bin Ali"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            disabled={pending}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="user@phn.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            disabled={pending}
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="min. 6 characters"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
          <select
            name="role"
            required
            disabled={pending}
            defaultValue=""
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="" disabled>Select role…</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r} — {ROLE_META[r].desc}
              </option>
            ))}
          </select>
        </div>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <div className="flex items-center gap-2 justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          {pending ? "Creating…" : "Create User"}
        </button>
      </div>
    </form>
  );
}

function EditUserModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [state, action, pending] = useActionState<UserFormState, FormData>(updateUser, undefined);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-extrabold text-gray-900 mb-1">Edit User</h3>
        <p className="text-xs text-gray-500 mb-4">Update name or email for <span className="font-semibold">{user.name}</span></p>
        <form action={action} className="space-y-3">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              required
              defaultValue={user.name}
              disabled={pending}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              disabled={pending}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold py-2 transition-colors cursor-pointer"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [state, action, pending] = useActionState<UserFormState, FormData>(resetPassword, undefined);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  if (state?.success) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-extrabold text-gray-900 mb-1">Reset Password</h3>
        <p className="text-xs text-gray-500 mb-4">
          Set a new password for <span className="font-semibold">{user.name}</span>
        </p>
        <form action={action} className="space-y-3">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              disabled={pending}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="min. 6 characters"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold py-2 transition-colors cursor-pointer"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApproveModal({
  user,
  onClose,
  onConfirm,
  isPending,
}: {
  user: UserRow;
  onClose: () => void;
  onConfirm: (role: string) => void;
  isPending: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState("USER");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-extrabold text-gray-900 mb-1">Approve Account</h3>
        <p className="text-xs text-gray-500 mb-4">
          Assign a role to <span className="font-semibold">{user.name}</span> before approving.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r} — {ROLE_META[r].desc}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold py-2 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(selectedRole)}
              disabled={isPending}
              className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold py-2 transition-colors cursor-pointer"
            >
              {isPending ? "Approving…" : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  pendingLabel,
  onClose,
  onConfirm,
  isPending,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-extrabold text-gray-900">{title}</h3>
          <p className="mt-1.5 text-xs text-gray-500">{message}</p>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold py-2 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold py-2 transition-colors cursor-pointer"
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = { users: UserRow[]; currentUserId: number };

export default function AdminClient({ users: initialUsers, currentUserId }: Props) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [approveTarget, setApproveTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<UserRow | null>(null);
  const [roleErrors, setRoleErrors] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();

  const activeUsers = initialUsers.filter((u) => u.status === "ACTIVE");
  const pendingUsers = initialUsers.filter((u) => u.status === "PENDING");

  function handleRoleChange(userId: number, newRole: string) {
    setRoleErrors((e) => ({ ...e, [userId]: "" }));
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        router.refresh();
      } catch (err) {
        setRoleErrors((e) => ({ ...e, [userId]: (err as Error).message }));
      }
    });
  }

  function handleApproveConfirm(userId: number, role: string) {
    startTransition(async () => {
      try {
        await approveUser(userId, role);
        setApproveTarget(null);
        router.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  function handleRejectConfirm(userId: number) {
    startTransition(async () => {
      try {
        await rejectUser(userId);
        setRejectTarget(null);
        router.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  function handleDeleteConfirm(userId: number) {
    startTransition(async () => {
      try {
        await deleteUser(userId);
        setDeleteTarget(null);
        router.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="w-full px-4 py-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">PHN Manufacturing</p>
            <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
            <p className="text-sm text-slate-300 mt-1">Configure user accounts and roles</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition-colors"
          >
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <main className="w-full px-4 py-7 space-y-6">

        {/* Role legend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Role Permissions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((r) => (
              <div key={r} className="flex items-start gap-2.5">
                <RoleBadge role={r} />
                <span className="text-xs text-gray-600">{ROLE_META[r].desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pending Approval ── */}
        {pendingUsers.length > 0 && (
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-amber-900">Pending Approval</h2>
                <p className="text-xs text-amber-700 mt-0.5">
                  {pendingUsers.length} registration request{pendingUsers.length !== 1 ? "s" : ""} awaiting review
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingUsers.length} pending
              </span>
            </div>
            <div className="divide-y divide-amber-50">
              {pendingUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Requested {fmt(user.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setApproveTarget(user)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectTarget(user)}
                      disabled={isPending}
                      className="text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Active Users table ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">Active Users</h2>
              <p className="text-xs text-gray-500 mt-0.5">{activeUsers.length} account{activeUsers.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add User
            </button>
          </div>

          {showAddForm && (
            <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/50">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">New User</p>
              <AddUserForm onSuccess={() => { setShowAddForm(false); router.refresh(); }} />
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {activeUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    {user.id === currentUserId && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {roleErrors[user.id] && (
                    <p className="text-xs text-red-600 mt-0.5">{roleErrors[user.id]}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={user.role}
                    disabled={isPending}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r} — {ROLE_META[r].desc}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setEditTarget(user)}
                    disabled={isPending}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setResetTarget(user)}
                    disabled={isPending}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reset Password
                  </button>

                  {user.id !== currentUserId && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(user)}
                      disabled={isPending}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {activeUsers.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                No active users yet. Add one above or approve a pending request.
              </div>
            )}
          </div>
        </div>

      </main>

      {editTarget && (
        <EditUserModal user={editTarget} onClose={() => { setEditTarget(null); router.refresh(); }} />
      )}

      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      )}

      {approveTarget && (
        <ApproveModal
          user={approveTarget}
          onClose={() => setApproveTarget(null)}
          onConfirm={(role) => handleApproveConfirm(approveTarget.id, role)}
          isPending={isPending}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete user?"
          message={<><span className="font-semibold">{deleteTarget.name}</span> ({deleteTarget.email}) will be permanently removed. This cannot be undone.</>}
          confirmLabel="Delete"
          pendingLabel="Deleting…"
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteConfirm(deleteTarget.id)}
          isPending={isPending}
        />
      )}

      {rejectTarget && (
        <ConfirmModal
          title="Reject registration?"
          message={<>The registration request for <span className="font-semibold">{rejectTarget.name}</span> ({rejectTarget.email}) will be permanently deleted.</>}
          confirmLabel="Reject"
          pendingLabel="Rejecting…"
          onClose={() => setRejectTarget(null)}
          onConfirm={() => handleRejectConfirm(rejectTarget.id)}
          isPending={isPending}
        />
      )}

    </div>
  );
}
