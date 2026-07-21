"use client";

import { useState } from "react";
import Link from "next/link";
import { AmortizationRecord, MONTH_ORDER } from "../../../data/amortization";
import { saveMonthlyData, deleteMonthlyRecord } from "../../../actions/monthly";

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtC = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

type ModalState = { mode: "add"; month: string } | { mode: "update"; month: string; current: number };

type Props = {
  part: AmortizationRecord;
  year: string;
  initialMonths: Record<string, number>;
  existingAnnualQty: number | null;
  role: string;
};

export default function MonthlyPageClient({ part, year, initialMonths, existingAnnualQty, role }: Props) {
  const [months, setMonths] = useState<Record<string, number>>(initialMonths);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [qtyInput, setQtyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const isAdmin = role === "IT";
  const canEdit = role !== "USER";

  const id = part.id;
  const currentYear = new Date().getFullYear().toString();
  const isCurrentYear = year === currentYear;
  // Closed (past) years are normally locked; IT admins may override to correct records.
  const canEditYear = isCurrentYear ? canEdit : isAdmin;
  const isAdminOverride = canEditYear && !isCurrentYear;
  const ratePerUnit = part.toolingCost + part.packagingCost + part.others;
  const recordedMonths = MONTH_ORDER.filter((m) => (months[m] ?? 0) > 0);
  const unrecordedMonths = MONTH_ORDER.filter((m) => (months[m] ?? 0) === 0);

  const ytdQty = recordedMonths.reduce((s, m) => s + (months[m] ?? 0), 0);
  const ytdRecovered = ytdQty * ratePerUnit;
  const lastYearKey = Object.keys(part.years).sort().filter((y) => y !== year).at(-1);
  const prevBalance = lastYearKey ? part.years[lastYearKey].balanceInvestment : part.totalCost;
  const balance = prevBalance - ytdRecovered;

  function openAdd() {
    if (unrecordedMonths.length === 0) return;
    setModal({ mode: "add", month: unrecordedMonths[0] });
    setQtyInput("");
  }

  function openUpdate(month: string) {
    setModal({ mode: "update", month, current: months[month] ?? 0 });
    setQtyInput(String(months[month] ?? 0));
  }

  async function handleDelete(month: string) {
    setConfirmDelete(null);
    setDeleting(month);
    try {
      const updated = { ...months };
      delete updated[month];
      setMonths(updated);
      await deleteMonthlyRecord(id, year, month);
    } catch (err) {
      setMonths(months);
      alert((err as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleModalSave() {
    if (!modal) return;
    const qty = Math.max(0, parseInt(qtyInput) || 0);
    const updated = { ...months, [modal.month]: qty };
    setMonths(updated);
    setModal(null);
    setSaving(true);
    try {
      await saveMonthlyData(id, year, updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
        <div className="w-full px-4 pt-5">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="font-semibold text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <span className="text-slate-600">/</span>
            <Link href={`/parts/${id}`} className="font-semibold text-slate-400 hover:text-white transition-colors">{part.partName}</Link>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-white">{year} Monthly</span>
          </div>
        </div>

        <div className="w-full px-4 pt-5 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${part.category === "CUSTOMER" ? "bg-blue-500/30 text-blue-100 ring-1 ring-blue-400/50" : "bg-orange-500/30 text-orange-100 ring-1 ring-orange-400/50"}`}>
                  {part.category}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-slate-200 text-xs font-semibold">{part.customerVendor}</span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-slate-200 text-xs font-semibold">{part.model}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">{part.partName}</h1>
              <p className="mt-1.5 text-sm font-semibold text-slate-300">{year} · Monthly Delivery Breakdown</p>
              {isAdminOverride && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-200 bg-amber-500/20 ring-1 ring-amber-400/50 px-2.5 py-1 rounded-full">
                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  Admin override — editing closed period
                </span>
              )}
            </div>

            <div className="flex gap-6 lg:gap-10 shrink-0">
              {[
                { label: "YTD Qty (PCS)",       value: fmtN(ytdQty),       cls: "text-white"       },
                { label: "YTD Recovered (RM)", value: fmtC(ytdRecovered), cls: "text-emerald-300" },
                { label: "Balance (RM)",       value: balance > 0 ? fmtC(balance) : "Cleared", cls: balance > 0 ? "text-rose-300" : "text-emerald-300" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{label}</p>
                  <p className={`text-2xl font-extrabold mt-0.5 ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <main className="w-full px-4 py-8 flex-1">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">{year} Monthly Records</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {recordedMonths.length} of 12 months recorded
                {saving && <span className="ml-2 text-blue-500">Saving…</span>}
              </p>
            </div>
            {canEditYear ? (
              <button
                onClick={openAdd}
                disabled={unrecordedMonths.length === 0}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add Record
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                {isCurrentYear ? "View only" : "Past year — view only"}
              </span>
            )}
          </div>

          {recordedMonths.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm font-semibold text-gray-500">No monthly records yet</p>
              <p className="text-xs text-gray-400">
                {canEditYear ? "Click “Add Record” to start recording deliveries" : "No deliveries have been recorded for this year"}
              </p>
              {existingAnnualQty !== null && (
                <div className="mx-auto max-w-sm rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-left">
                  <p className="text-xs font-bold text-amber-800">Annual total on record: {fmtN(existingAnnualQty)} PCS</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    This year has an existing annual total without a monthly breakdown. Enter the monthly figures — they will replace the annual total once saved.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Month", "Qty Delivered (PCS)", "Investment Recovered (RM)", "Cumul. Qty (PCS)", "Cumul. Recovered (RM)", ""].map((h, i) => (
                    <th key={i} className={`px-6 py-3 text-xs font-bold text-gray-700 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  let cQty = 0; let cRec = 0;
                  return recordedMonths.map((month) => {
                    const qty = months[month] ?? 0;
                    const recovered = qty * ratePerUnit;
                    cQty += qty; cRec += recovered;
                    return (
                      <tr key={month} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-extrabold text-gray-900">{month}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-gray-800">{fmtN(qty)}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-700">{fmtC(recovered)}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-gray-600">{fmtN(cQty)}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-600">{fmtC(cRec)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {canEditYear && <button
                              onClick={() => openUpdate(month)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                              </svg>
                              Update
                            </button>}
                            {isAdmin && (
                              <button
                                onClick={() => setConfirmDelete(month)}
                                disabled={deleting === month}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                {deleting === month ? (
                                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                  </svg>
                                )}
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-slate-800">
                  <td className="px-6 py-3.5 font-extrabold text-white">TOTAL</td>
                  <td className="px-6 py-3.5 text-right font-extrabold text-white">{fmtN(ytdQty)}</td>
                  <td className="px-6 py-3.5 text-right font-extrabold text-emerald-300">{fmtC(ytdRecovered)}</td>
                  <td className="px-6 py-3.5 text-right font-extrabold text-white">{fmtN(ytdQty)}</td>
                  <td className="px-6 py-3.5 text-right font-extrabold text-emerald-300">{fmtC(ytdRecovered)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </main>

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-extrabold text-gray-900">
                  {modal.mode === "add" ? "Add Monthly Record" : `Update ${modal.month} Record`}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{year} · {part.partNo}</p>
              </div>
              <button onClick={() => setModal(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
                {modal.mode === "add" ? (
                  <select
                    value={modal.month}
                    onChange={(e) => setModal({ mode: "add", month: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {unrecordedMonths.map((m) => <option key={m}>{m}</option>)}
                  </select>
                ) : (
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-900">
                    {modal.month}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Qty Delivered</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  autoFocus
                  value={qtyInput}
                  onChange={(e) => setQtyInput(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {ratePerUnit > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-0.5">Investment Recovered</p>
                  <p className="text-lg font-extrabold text-emerald-800">
                    {fmtC((parseInt(qtyInput) || 0) * ratePerUnit)}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{parseInt(qtyInput) || 0} units × RM {fmtC(ratePerUnit)}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                disabled={!qtyInput || parseInt(qtyInput) < 0 || saving}
                className="px-5 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {modal.mode === "add" ? "Add Record" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl">
            <div className="px-6 pt-6 pb-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="mt-3 text-sm font-extrabold text-gray-900">Delete {confirmDelete} record?</h2>
              <p className="mt-1.5 text-xs text-gray-500">
                This will permanently remove the {confirmDelete} delivery record for {year} and recalculate all year totals. This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 mt-2 flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-5 py-2 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
