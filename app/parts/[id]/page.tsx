import Link from "next/link";
import { notFound } from "next/navigation";
import { getPartById } from "../../actions/records";
import YearCardCarousel from "../../components/YearCardCarousel";
import EditRecordButton from "../../components/EditRecordButton";
import DeleteRecordButton from "../../components/DeleteRecordButton";
import { getCurrentSession } from "../../lib/dal";

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtC = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const YEAR_PALETTE = [
  { accent: "#f59e0b", recBg: "bg-amber-50", recBorder: "border-amber-300", recText: "text-amber-900", balBg: "bg-teal-50", balBorder: "border-teal-300", balText: "text-teal-900", barColor: "bg-amber-400" },
  { accent: "#3b82f6", recBg: "bg-blue-50", recBorder: "border-blue-300", recText: "text-blue-900", balBg: "bg-indigo-50", balBorder: "border-indigo-300", balText: "text-indigo-900", barColor: "bg-blue-500" },
  { accent: "#10b981", recBg: "bg-emerald-50", recBorder: "border-emerald-300", recText: "text-emerald-900", balBg: "bg-green-50", balBorder: "border-green-300", balText: "text-green-900", barColor: "bg-emerald-500" },
  { accent: "#8b5cf6", recBg: "bg-violet-50", recBorder: "border-violet-300", recText: "text-violet-900", balBg: "bg-purple-50", balBorder: "border-purple-300", balText: "text-purple-900", barColor: "bg-violet-500" },
];

function StatCard({ label, value, sub, valueClass = "text-gray-900" }: { label: string; value: string; sub?: string; valueClass?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-extrabold leading-none ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs font-medium text-gray-700">{sub}</p>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-xs font-bold text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default async function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [part, session] = await Promise.all([getPartById(id), getCurrentSession()]);
  if (!part) notFound();

  const role = session?.role ?? "USER";
  const canEdit = role !== "USER";
  const lockedCategory =
    role === "BD" ? "CUSTOMER" : role === "PVD" ? "VENDOR" : null;

  const sortedYears = Object.keys(part.years).sort();
  const totalRecovered = Object.values(part.years).reduce((s, y) => s + y.investmentRecovered, 0);
  const recoveryPct = part.totalCost > 0 ? (totalRecovered / part.totalCost) * 100 : 0;
  const ratePerUnit = part.toolingCost + part.packagingCost + part.others;
  const lastYearKey = sortedYears.at(-1);
  const balanceInvestment = lastYearKey ? Math.max(part.years[lastYearKey].balanceInvestment, 0) : 0;
  let runningCumRecovered = 0;
  const yearEntries = sortedYears.map((year, i) => {
    const y = part.years[year];
    runningCumRecovered += y.investmentRecovered;
    return {
      year,
      y,
      cumRecovered: runningCumRecovered,
      cumPct: part.totalCost > 0 ? (runningCumRecovered / part.totalCost) * 100 : 0,
      yearPct: part.totalCost > 0 ? (y.investmentRecovered / part.totalCost) * 100 : 0,
      palette: YEAR_PALETTE[i % YEAR_PALETTE.length],
    };
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
        <div className="mx-auto max-w-screen-xl px-8 pt-5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors">
            <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            Amortization Dashboard
          </Link>
          <div className="flex items-center gap-2">
            {canEdit && <EditRecordButton part={part} lockedCategory={lockedCategory} />}
            {role === "IT" && <DeleteRecordButton partId={part.id} partName={part.partName} />}
          </div>
        </div>

        <div className="mx-auto max-w-screen-xl px-8 pb-8 pt-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${part.category === "CUSTOMER" ? "bg-blue-500/30 text-blue-100 ring-1 ring-blue-400/50" : "bg-orange-500/30 text-orange-100 ring-1 ring-orange-400/50"}`}>
                  {part.category}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-slate-200 text-xs font-semibold">{part.sop}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">{part.partName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="bg-white/10 text-white text-xs font-mono font-semibold px-2.5 py-1 rounded-md">{part.partNo}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-100 text-sm font-bold">{part.customerVendor}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-200 text-sm font-semibold">{part.model}</span>
              </div>
            </div>

            <div className="flex gap-6 lg:gap-10 shrink-0">
              {[
                { label: "Total Cost (RM)", value: fmtC(part.totalCost), cls: "text-white" },
                { label: "Recovery", value: `${recoveryPct.toFixed(1)}%`, cls: recoveryPct >= 100 ? "text-emerald-300" : recoveryPct >= 50 ? "text-amber-300" : "text-red-300" },
                { label: "Balance (RM)", value: balanceInvestment > 0 ? fmtC(balanceInvestment) : "Cleared", cls: balanceInvestment > 0 ? "text-rose-300" : "text-emerald-300" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{label}</p>
                  <p className={`text-2xl font-extrabold mt-0.5 ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-400" style={{ width: `${Math.min(recoveryPct, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-semibold text-slate-300">
              <span>0%</span>
              <span>Recovered {recoveryPct.toFixed(2)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <main className="mx-auto max-w-screen-xl w-full px-8 py-8 flex-1">
        <div className="flex gap-7">

          {/* SIDEBAR */}
          <aside className="w-72 shrink-0 space-y-5">
            {[
              {
                title: "Part Information",
                rows: [
                  { label: "Part No", value: part.partNo },
                  { label: "Part Name", value: part.partName },
                  { label: "Customer / Vendor", value: part.customerVendor },
                  { label: "Category", value: part.category },
                  { label: "Model", value: part.model },
                  { label: "SOP", value: part.sop },
                ],
              },
              {
                title: "Cost Breakdown / Unit",
                rows: [
                  { label: "Tooling Cost (RM)", value: fmtC(part.toolingCost) },
                  { label: "Packaging Cost (RM)", value: fmtC(part.packagingCost) },
                  { label: "Others (RM)", value: fmtC(part.others) },
                ],
              },
            ].map(({ title, rows }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-800 border-b border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-200">{title}</p>
                </div>
                <div className="px-5 py-1">
                  {rows.map((r) => <InfoRow key={r.label} label={r.label} value={r.value} />)}
                </div>
                {title === "Cost Breakdown / Unit" && (
                  <div className="mx-5 mb-4 mt-1 rounded-lg bg-slate-800 px-4 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Rate / Unit (RM)</span>
                    <span className="text-sm font-extrabold text-white">{fmtC(ratePerUnit)}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Volume */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-800 border-b border-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Volume Summary</p>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Amortization Vol (PCS)" value={fmtN(part.ammVol)} />
                <InfoRow label="Total Qty Delivered (PCS)" value={fmtN(part.totalQtyDel)} />
                <InfoRow label="Balance Qty (PCS)" value={fmtN(part.totalBalQty)} />
              </div>
              <div className="px-5 pb-4 pt-1">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-slate-700" style={{ width: `${part.ammVol > 0 ? Math.min((part.totalQtyDel / part.ammVol) * 100, 100) : 0}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-gray-600 mt-1.5">
                  <span>{fmtN(part.totalQtyDel)} delivered</span>
                  <span>{fmtN(part.totalBalQty)} remaining</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Total Investment (RM)" value={fmtC(part.totalCost)} sub={`${fmtN(part.ammVol)} units × ${fmtC(ratePerUnit)}`} />
              <StatCard label="Total Recovered (RM)" value={fmtC(totalRecovered)} sub={`${recoveryPct.toFixed(1)}% of total`} valueClass="text-emerald-600" />
              <StatCard label="Balance Investment (RM)" value={balanceInvestment > 0 ? fmtC(balanceInvestment) : "Cleared"} sub={`${fmtN(part.totalBalQty)} units remaining`} valueClass={balanceInvestment > 0 ? "text-rose-600" : "text-emerald-600"} />
              <StatCard label="Qty Delivered (PCS)" value={fmtN(part.totalQtyDel)} sub={`of ${fmtN(part.ammVol)} total volume`} valueClass="text-blue-600" />
            </div>

            {/* Year cards */}
            <YearCardCarousel
              partId={part.id}
              yearEntries={yearEntries}
              totalCost={part.totalCost}
            />

            {/* Timeline table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-slate-800 border-b border-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Cumulative Recovery Timeline</p>
              </div>
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {["Year", "Qty Delivered (PCS)", "Investment Recovered (RM)", "Balance Investment (RM)", "Cumul. Recovery %", "Progress"].map((h, i) => (
                      <th key={h} className={`px-6 py-3 text-xs font-bold text-gray-700 ${i === 0 || i === 5 ? "text-left" : "text-right"} ${i === 5 ? "w-48" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {yearEntries.map(({ year, y, cumPct, palette }) => {
                    const hasData = y.qtyDel > 0 || y.investmentRecovered > 0;
                    return (
                      <tr key={year} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-extrabold text-gray-900">{year}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-gray-800">{hasData ? fmtN(y.qtyDel) : <span className="text-gray-400">—</span>}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-700">{hasData ? fmtC(y.investmentRecovered) : <span className="text-gray-400 font-normal">—</span>}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-rose-600">{y.balanceInvestment > 0 ? fmtC(y.balanceInvestment) : <span className="text-gray-400 font-normal">—</span>}</td>
                        <td className="px-6 py-3.5 text-right font-extrabold text-gray-900">{hasData ? `${cumPct.toFixed(2)}%` : <span className="text-gray-400 font-normal">—</span>}</td>
                        <td className="px-6 py-3.5">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className={`h-2 rounded-full ${palette.barColor}`} style={{ width: `${Math.min(cumPct, 100)}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-slate-800">
                    <td className="px-6 py-3.5 font-extrabold text-white text-nowrap">TOTAL (YTD)</td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-white">{fmtN(part.totalQtyDel)}</td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-emerald-300">{fmtC(totalRecovered)}</td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-rose-300">{balanceInvestment > 0 ? fmtC(balanceInvestment) : "—"}</td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-white">{recoveryPct.toFixed(2)}%</td>
                    <td className="px-6 py-3.5">
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-400" style={{ width: `${Math.min(recoveryPct, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
