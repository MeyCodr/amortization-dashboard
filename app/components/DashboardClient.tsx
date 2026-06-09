"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AmortizationRecord, getSummaryStats } from "../data/amortization";
import { createRecord } from "../actions/records";
import { logout } from "../actions/auth";
import { exportAmortizationToExcel } from "../lib/exportAmortizationExcel";
import AmortizationTable from "./AmortizationTable";
import FilterBar from "./FilterBar";
import ImportExcelModal from "./ImportExcelModal";
import NewRecordModal from "./NewRecordModal";

const fmtC = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

const YEAR_STYLES: Record<string, { headerBg: string; borderClass: string; textClass: string; barClass: string }> = {
  "2023": { headerBg: "#f59e0b", borderClass: "border-amber-200", textClass: "text-amber-900", barClass: "bg-amber-400" },
  "2024": { headerBg: "#3b82f6", borderClass: "border-blue-200", textClass: "text-blue-900", barClass: "bg-blue-500" },
  "2025": { headerBg: "#10b981", borderClass: "border-emerald-200", textClass: "text-emerald-900", barClass: "bg-emerald-500" },
  "2026": { headerBg: "#8b5cf6", borderClass: "border-violet-200", textClass: "text-violet-900", barClass: "bg-violet-500" },
};
const DEFAULT_YEAR_STYLE = { headerBg: "#64748b", borderClass: "border-slate-200", textClass: "text-slate-900", barClass: "bg-slate-500" };

const ROLE_META: Record<string, { label: string; color: string }> = {
  IT: { label: "IT", color: "bg-purple-500/20 text-purple-200 border-purple-400/40" },
  BD: { label: "BD", color: "bg-blue-500/20 text-blue-200 border-blue-400/40" },
  PVD: { label: "PVD", color: "bg-amber-500/20 text-amber-200 border-amber-400/40" },
  USER: { label: "User", color: "bg-white/10 text-slate-300 border-white/20" },
};

type Props = {
  initialRecords: AmortizationRecord[];
  role: "BD" | "PVD" | "IT" | "USER" | null;
  userName: string | null;
};

export default function DashboardClient({ initialRecords, role, userName }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [yearOffset, setYearOffset] = useState(0);

  const canEdit = role !== null && role !== "USER";
  const lockedCategory: "CUSTOMER" | "VENDOR" | null =
    role === "BD" ? "CUSTOMER" : role === "PVD" ? "VENDOR" : null;
  const roleMeta = role ? (ROLE_META[role] ?? ROLE_META.USER) : null;

  async function handleExportExcel() {
    setExporting(true);
    try {
      await exportAmortizationToExcel(filtered);
    } finally {
      setExporting(false);
    }
  }

  async function addRecord(record: AmortizationRecord) {
    setSaving(true);
    try {
      await createRecord(record);
      setShowModal(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const filterKey = `${search}|${categoryFilter}`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchesField = (value: string | null | undefined) =>
      (value ?? "").toLowerCase().includes(q);

    return initialRecords.filter((r) => {
      const category = String(r.category ?? "").toUpperCase();
      const matchesSearch =
        !q ||
        matchesField(r.customerVendor) ||
        matchesField(r.model) ||
        matchesField(r.partNo) ||
        matchesField(r.partName) ||
        matchesField(r.category) ||
        matchesField(r.id);
      const matchesCat = !categoryFilter || category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [initialRecords, search, categoryFilter]);

  const stats = useMemo(() => getSummaryStats(initialRecords), [initialRecords]);
  const yearKeys = Object.keys(stats.yearTotals).sort();

  const YEAR_PAGE = 3;
  const maxYearOffset = Math.max(0, yearKeys.length - YEAR_PAGE);
  const safeOffset = Math.min(yearOffset, maxYearOffset);
  const visibleYearEnd = yearKeys.length - safeOffset;
  const visibleYears = yearKeys.slice(Math.max(0, visibleYearEnd - YEAR_PAGE), visibleYearEnd);
  const canGoLeft = safeOffset < maxYearOffset;
  const canGoRight = safeOffset > 0;
  const yearGridCols = visibleYears.length === 1 ? "grid-cols-1" : visibleYears.length === 2 ? "grid-cols-2" : "grid-cols-3";

  const modelTotals = useMemo(() => {
    const map: Record<string, { totalCost: number; totalRecovered: number; partCount: number }> = {};
    for (const r of initialRecords) {
      if (!map[r.model]) map[r.model] = { totalCost: 0, totalRecovered: 0, partCount: 0 };
      map[r.model].totalCost += r.totalCost;
      map[r.model].totalRecovered += Object.values(r.years).reduce((s, y) => s + y.investmentRecovered, 0);
      map[r.model].partCount += 1;
    }
    return Object.entries(map).sort((a, b) => b[1].totalRecovered - a[1].totalRecovered);
  }, [initialRecords]);

  const categoryTotals = useMemo(() => {
    const map: Record<string, { totalCost: number; totalRecovered: number; partCount: number }> = {
      CUSTOMER: { totalCost: 0, totalRecovered: 0, partCount: 0 },
      VENDOR: { totalCost: 0, totalRecovered: 0, partCount: 0 },
    };
    for (const r of initialRecords) {
      map[r.category].totalCost += r.totalCost;
      map[r.category].totalRecovered += Object.values(r.years).reduce((s, y) => s + y.investmentRecovered, 0);
      map[r.category].partCount += 1;
    }
    return Object.entries(map);
  }, [initialRecords]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="mx-auto max-w-screen-xl px-8 pt-4 pb-6">

          {/* User info bar */}
          <div className="flex items-center justify-between mb-5 py-2 border-b border-white/10">
            {roleMeta && (
              <>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${roleMeta.color}`}>
                    {roleMeta.label}
                  </span>
                  <span className="text-sm font-semibold text-white">{userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {role === "IT" && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                      </svg>
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                    Profile
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.085a.75.75 0 10-1.004-1.116l-2.5 2.25a.75.75 0 000 1.116l2.5 2.25a.75.75 0 101.004-1.116l-1.048-1.085h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                      </svg>
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">PHN Manufacturing</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Amortization Volume Tracker
              </h1>
              <p className="text-sm text-white mt-1.5">Tooling &amp; packaging cost recovery by part</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-widest text-slate-200">As of</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Investment (RM)", value: fmtC(stats.totalCost), sub: `${stats.totalRecords} parts · ${fmtN(stats.totalAmmVol)} units`, valueColor: "text-white" },
              { label: "Total Recovered (RM)", value: fmtC(stats.totalRecovered), sub: `${stats.recoveryRate.toFixed(1)}% recovery rate`, valueColor: "text-emerald-400" },
              { label: "Balance to Recover (RM)", value: fmtC(stats.totalBalance), sub: `${fmtN(stats.totalBalQty)} units remaining`, valueColor: "text-rose-400" },
              { label: "Total Qty Delivered (PCS)", value: fmtN(stats.totalQtyDel), sub: `of ${fmtN(stats.totalAmmVol)} amortization vol`, valueColor: "text-blue-400" },
            ].map(({ label, value, sub, valueColor }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white">{label}</p>
                <p className={`mt-1.5 text-2xl font-extrabold leading-none ${valueColor}`}>{value}</p>
                <p className="mt-1 text-xs text-white">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <main className="mx-auto max-w-screen-xl w-full px-8 py-7 flex-1 space-y-6">

        {/* Recovery by Model */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-3">Recovery by Model</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {modelTotals.map(([model, { totalCost, totalRecovered, partCount }], i) => {
                const pct = totalCost > 0 ? (totalRecovered / totalCost) * 100 : 0;
                const barColors = ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
                const barColor = barColors[i % barColors.length];
                return (
                  <div key={model} className="px-5 py-3.5 flex items-center gap-4">
                    <div className="w-36 shrink-0">
                      <p className="text-sm font-extrabold text-gray-900">{model}</p>
                      <p className="text-[10px] text-gray-500">{partCount} part{partCount !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                    <div className="w-40 text-right shrink-0">
                      <p className="text-sm font-extrabold text-gray-900">RM {fmtC(totalRecovered)}</p>
                      <p className="text-[10px] text-gray-500">{pct.toFixed(1)}% recovered</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recovery by Category */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-3">Recovery by Category</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {categoryTotals.map(([category, { totalCost, totalRecovered, partCount }]) => {
                const pct = totalCost > 0 ? (totalRecovered / totalCost) * 100 : 0;
                const isCustomer = category === "CUSTOMER";
                return (
                  <div key={category} className="px-5 py-3.5 flex items-center gap-4">
                    <div className="w-36 shrink-0 flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${isCustomer ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
                        {isCustomer ? "CUST" : "VEND"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-900">{isCustomer ? "Customer" : "Vendor"}</p>
                        <p className="text-[10px] text-gray-500">{partCount} part{partCount !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${isCustomer ? "bg-blue-500" : "bg-orange-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                    <div className="w-40 text-right shrink-0">
                      <p className="text-sm font-extrabold text-gray-900">RM {fmtC(totalRecovered)}</p>
                      <p className="text-[10px] text-gray-500">{pct.toFixed(1)}% recovered</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800">Recovery by Year</p>
            {yearKeys.length > YEAR_PAGE && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setYearOffset((o) => Math.min(o + 1, maxYearOffset))}
                  disabled={!canGoLeft}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="View older years"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 010 1.06L8.06 10l3.72 3.72a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="text-[10px] font-semibold text-gray-500 px-1 tabular-nums">
                  {visibleYears[0]}–{visibleYears[visibleYears.length - 1]}
                </span>
                <button
                  type="button"
                  onClick={() => setYearOffset((o) => Math.max(o - 1, 0))}
                  disabled={!canGoRight}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="View newer years"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className={`grid ${yearGridCols} gap-4`}>
            {visibleYears.map((year) => {
              const recovered = stats.yearTotals[year];
              const pct = stats.totalCost > 0 ? (recovered / stats.totalCost) * 100 : 0;
              const style = YEAR_STYLES[year] ?? DEFAULT_YEAR_STYLE;
              return (
                <div key={year} className={`bg-white rounded-xl border ${style.borderClass} shadow-sm overflow-hidden`}>
                  <div style={{ backgroundColor: style.headerBg }} className="px-5 py-3 flex justify-between items-center">
                    <span className="text-xl font-extrabold text-white">{year}</span>
                    <span className="text-xs font-bold text-white bg-white/25 rounded-full px-2.5 py-0.5">{pct.toFixed(1)}% of total</span>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-1">Investment Recovered (RM)</p>
                    <p className={`text-2xl font-extrabold ${style.textClass}`}>{fmtC(recovered)}</p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${style.barClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">Part-Level Amortization Records</h2>
                <p className="text-xs text-gray-700 mt-0.5">Click any row to view full year-by-year breakdown</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                  {initialRecords.filter(r => r.category === "CUSTOMER").length} Customers
                </span>
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block" />
                  {initialRecords.filter(r => r.category === "VENDOR").length} Vendors
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-300 transition-colors cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.5 3A1.5 1.5 0 003 4.5v11A1.5 1.5 0 004.5 17h11a1.5 1.5 0 001.5-1.5V9.621a1.5 1.5 0 00-.44-1.06L11.94 5.44A1.5 1.5 0 0010.878 5H4.5zm4.25 2.5a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z" clipRule="evenodd" />
                    </svg>
                    Import Excel
                    {/* {lockedCategory && (
                      <span className="text-[10px] font-semibold opacity-70">({lockedCategory === "CUSTOMER" ? "CUST" : "VEND"})</span>
                    )} */}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exporting || filtered.length === 0}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13zm7.857 1.09a.5.5 0 00-.707 0L4.5 9.939V16.5h11V8.414l-4.146-4.147a.5.5 0 00-.707 0L10.5 6.793l-1.793-1.793a.5.5 0 00-.707 0L6.207 7.793l1.65 1.65zM4.5 8.086l2.293-2.293L8.793 7.793 7.146 9.44 4.5 8.086z" clipRule="evenodd" />
                  </svg>
                  {exporting ? "Exporting…" : "Export Excel"}
                </button>
                {canEdit && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    New Record
                  </button>
                )}
              </div>
            </div>
            <FilterBar
              search={search}
              statusFilter={categoryFilter}
              onSearchChange={setSearch}
              onStatusChange={setCategoryFilter}
              totalCount={initialRecords.length}
              filteredCount={filtered.length}
            />
          </div>
          <div className="p-5">
            <AmortizationTable data={filtered} filterKey={filterKey} />
          </div>
        </div>

      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="mx-auto max-w-screen-xl px-8 py-4 flex items-center justify-between text-xs text-gray-400">
          <span className="text-gray-600">Amortization Volume Tracker · PHN Manufacturing</span>
          <span className="text-gray-600">{new Date().getFullYear()}</span>
        </div>
      </footer>

      {showModal && (
        <NewRecordModal
          onClose={() => setShowModal(false)}
          onSubmit={addRecord}
          saving={saving}
          lockedCategory={lockedCategory}
        />
      )}

      {showImportModal && (
        <ImportExcelModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
