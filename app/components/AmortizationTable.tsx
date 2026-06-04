"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AmortizationRecord } from "../data/amortization";

type Props = {
  data: AmortizationRecord[];
  /** Changes when search/category filters change — resets pagination to page 1 */
  filterKey?: string;
};

const PAGE_SIZE = 20;

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
const fmtC = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const thBase = "px-3 py-2.5 text-xs font-semibold text-slate-200 whitespace-nowrap border-b border-slate-600 bg-slate-800";
const tdBase = "px-3 py-2.5 text-xs whitespace-nowrap";

export default function AmortizationTable({ data, filterKey = "" }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [page, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  const rangeStart = data.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, data.length);

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead>
            <tr>
              <th className={`${thBase} text-left`}>CATEGORY</th>
              <th className={`${thBase} text-left`}>CUSTOMER / VENDOR</th>
              <th className={`${thBase} text-left`}>MODEL</th>
              <th className={`${thBase} text-left`}>PART NO</th>
              <th className={`${thBase} text-left`}>PART NAME</th>
              <th className={`${thBase} text-center`}>SOP</th>
              <th className={`${thBase} text-right`}>AMM. VOL (PCS)</th>
              <th className={`${thBase} text-right`}>TOTAL COST (RM)</th>
              <th className={`${thBase} text-right`}>TOTAL QTY DEL (PCS)</th>
              <th className={`${thBase} text-right`}>BAL QTY (PCS)</th>
              <th className={`${thBase} text-center w-8`} />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-gray-500 font-medium">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr
                  key={row.id}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition-colors group`}
                >
                  <td className={tdBase}>
                    <Link href={`/parts/${row.id}`} className="block">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${row.category === "CUSTOMER" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {row.category}
                      </span>
                    </Link>
                  </td>
                  <td className={`${tdBase} font-bold text-gray-900`}>
                    <Link href={`/parts/${row.id}`} className="block hover:text-blue-600">{row.customerVendor}</Link>
                  </td>
                  <td className={`${tdBase} font-semibold text-gray-800`}>
                    <Link href={`/parts/${row.id}`} className="block">{row.model}</Link>
                  </td>
                  <td className={`${tdBase} font-mono font-medium text-gray-700`}>
                    <Link href={`/parts/${row.id}`} className="block">{row.partNo}</Link>
                  </td>
                  <td className={`${tdBase} font-medium text-gray-800 max-w-[200px] truncate`}>
                    <Link href={`/parts/${row.id}`} className="block truncate">{row.partName}</Link>
                  </td>
                  <td className={`${tdBase} text-center font-semibold text-gray-700`}>
                    <Link href={`/parts/${row.id}`} className="block">{row.sop}</Link>
                  </td>
                  <td className={`${tdBase} text-right font-bold text-gray-900`}>
                    <Link href={`/parts/${row.id}`} className="block">{fmtN(row.ammVol)}</Link>
                  </td>
                  <td className={`${tdBase} text-right font-bold text-gray-900`}>
                    <Link href={`/parts/${row.id}`} className="block">{fmtC(row.totalCost)}</Link>
                  </td>
                  <td className={`${tdBase} text-right font-semibold text-gray-900`}>
                    <Link href={`/parts/${row.id}`} className="block">{fmtN(row.totalQtyDel)}</Link>
                  </td>
                  <td className={`${tdBase} text-right font-bold ${row.totalBalQty > 0 ? "text-red-600" : "text-gray-500"}`}>
                    <Link href={`/parts/${row.id}`} className="block">{fmtN(row.totalBalQty)}</Link>
                  </td>
                  <td className={`${tdBase} text-center`}>
                    <Link href={`/parts/${row.id}`} className="block text-gray-400 group-hover:text-blue-500 transition-colors">
                      <svg className="h-3.5 w-3.5 mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {data.length > 0 && (
            <tfoot>
              <tr className="bg-slate-800 border-t-2 border-slate-600">
                <td className={`${tdBase} font-bold text-white`} colSpan={2}>TOTAL</td>
                <td className={tdBase} colSpan={5} />
                <td className={`${tdBase} text-right font-bold text-white`}>
                  {fmtC(data.reduce((s, r) => s + r.totalCost, 0))}
                </td>
                <td className={`${tdBase} text-right font-bold text-white`}>
                  {fmtN(data.reduce((s, r) => s + r.totalQtyDel, 0))}
                </td>
                <td className={`${tdBase} text-right font-bold text-rose-400`}>
                  {fmtN(data.reduce((s, r) => s + r.totalBalQty, 0))}
                </td>
                <td className={tdBase} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {data.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600">
            Showing <span className="font-semibold text-gray-900">{rangeStart}–{rangeEnd}</span> of{" "}
            <span className="font-semibold text-gray-900">{data.length}</span> records
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                const prev = arr[i - 1];
                if (prev !== undefined && p - prev > 1) acc.push("ellipsis");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`min-w-[2rem] px-2 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      currentPage === item
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
