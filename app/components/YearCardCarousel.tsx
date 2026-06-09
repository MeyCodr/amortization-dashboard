"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import YearCard from "./YearCard";
import { YearData } from "../data/amortization";

type Palette = {
  accent: string;
  recBg: string; recBorder: string; recText: string;
  balBg: string; balBorder: string; balText: string;
  barColor: string;
};

type YearEntry = {
  year: string;
  y: YearData;
  cumPct: number;
  yearPct: number;
  palette: Palette;
};

type Props = {
  partId: string;
  yearEntries: YearEntry[];
  totalCost: number;
};

const YEAR_PAGE = 3;

export default function YearCardCarousel({ partId, yearEntries, totalCost }: Props) {
  const currentYear = new Date().getFullYear().toString();
  const [yearOffset, setYearOffset] = useState(0);
  const [addingYear, setAddingYear] = useState(false);
  const [yearInput, setYearInput] = useState(currentYear);
  const router = useRouter();

  function handleAddYear(e: React.FormEvent) {
    e.preventDefault();
    const y = yearInput.trim();
    if (/^\d{4}$/.test(y)) {
      router.push(`/parts/${partId}/${y}`);
    }
  }

  const maxOffset = Math.max(0, yearEntries.length - YEAR_PAGE);
  const safeOffset = Math.min(yearOffset, maxOffset);
  const visibleEnd = yearEntries.length - safeOffset;
  const visible = yearEntries.slice(Math.max(0, visibleEnd - YEAR_PAGE), visibleEnd);
  const canGoLeft = safeOffset < maxOffset;
  const canGoRight = safeOffset > 0;

  const gridCols =
    visible.length === 1 ? "grid-cols-1" :
    visible.length === 2 ? "grid-cols-1 md:grid-cols-2" :
    "grid-cols-1 md:grid-cols-3";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-700">Year-by-Year Breakdown</p>
        <div className="flex items-center gap-2">
          {yearEntries.length > YEAR_PAGE && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setYearOffset((o) => Math.min(o + 1, maxOffset))}
                disabled={!canGoLeft}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="View older years"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 010 1.06L8.06 10l3.72 3.72a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-[10px] font-semibold text-gray-500 px-1 tabular-nums">
                {visible[0]?.year}–{visible[visible.length - 1]?.year}
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

          {addingYear ? (
            <form onSubmit={handleAddYear} className="flex items-center gap-1.5">
              <input
                autoFocus
                type="text"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                maxLength={4}
                pattern="\d{4}"
                placeholder="YYYY"
                className="w-20 rounded-lg border border-blue-400 bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!/^\d{4}$/.test(yearInput.trim())}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setAddingYear(false)}
                className="px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingYear(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add Year
            </button>
          )}
        </div>
      </div>

      {yearEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-sm font-semibold text-gray-500">No year records yet</p>
          <p className="text-xs text-gray-400 mt-1">Click &quot;Add Year&quot; above to record deliveries for a year</p>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-4`}>
          {visible.map(({ year, y, cumPct, yearPct, palette }) => (
            <YearCard
              key={year}
              partId={partId}
              year={year}
              currentYear={currentYear}
              y={y}
              cumPct={cumPct}
              yearPct={yearPct}
              totalCost={totalCost}
              palette={palette}
            />
          ))}
        </div>
      )}
    </div>
  );
}
