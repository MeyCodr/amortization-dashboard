import Link from "next/link";
import { YearData } from "../data/amortization";

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtC = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

type Palette = {
  accent: string;
  recBg: string; recBorder: string; recText: string;
  balBg: string; balBorder: string; balText: string;
};

type Props = {
  partId: string;
  year: string;
  currentYear: string;
  y: YearData;
  cumPct: number;
  yearPct: number;
  totalCost: number;
  palette: Palette;
};

export default function YearCard({ partId, year, currentYear, y, cumPct, yearPct, palette }: Props) {
  const hasData = y.qtyDel > 0 || y.investmentRecovered > 0;
  const isPast = year < currentYear;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div style={{ backgroundColor: palette.accent }} className="px-5 py-4">
        <div className="flex justify-between items-start">
          <span className="text-2xl font-extrabold text-white">{year}</span>
          {hasData && (
            <span className="text-xs font-bold text-white bg-white/25 rounded-full px-2.5 py-0.5">
              {cumPct.toFixed(1)}% cumul.
            </span>
          )}
        </div>
        {hasData && (
          <div className="mt-3">
            <div className="w-full bg-white/25 rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 rounded-full bg-white" style={{ width: `${Math.min(yearPct * 3, 100)}%` }} />
            </div>
            <p className="text-[10px] font-semibold text-white/90 mt-1">
              {yearPct.toFixed(1)}% of total recovered this year
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-5 space-y-3 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-600">Qty Delivered (PCS)</span>
          <span className="text-base font-extrabold text-gray-900">
            {hasData ? fmtN(y.qtyDel) : <span className="text-gray-400 font-normal text-sm">—</span>}
          </span>
        </div>

        <div className={`rounded-lg border ${palette.recBorder} ${palette.recBg} px-4 py-3`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Investment Recovered (RM)</p>
          <p className={`text-lg font-extrabold ${palette.recText}`}>
            {hasData ? fmtC(y.investmentRecovered) : <span className="text-gray-400 font-normal text-sm">—</span>}
          </p>
        </div>

        <div className={`rounded-lg border ${palette.balBorder} ${palette.balBg} px-4 py-3`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Balance Investment (RM)</p>
          <p className={`text-lg font-extrabold ${palette.balText}`}>
            {y.balanceInvestment > 0 ? fmtC(y.balanceInvestment) : <span className="text-gray-400 font-normal text-sm">—</span>}
          </p>
        </div>

        {/* Past year with no monthly data — hide the link entirely */}
        {!(isPast && !y.months) && (
          <Link
            href={`/parts/${partId}/${year}`}
            className="flex items-center justify-between w-full rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>
              {isPast
                ? "View monthly deliveries"
                : y.months ? "View monthly deliveries" : "Add monthly deliveries"}
            </span>
            <svg className="h-3.5 w-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        )}

        {!hasData && (
          <p className="text-center text-xs font-semibold text-gray-500 py-4">No deliveries recorded</p>
        )}
      </div>
    </div>
  );
}
