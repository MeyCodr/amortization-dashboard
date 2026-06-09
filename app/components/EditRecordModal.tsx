"use client";

import { useState } from "react";
import { AmortizationRecord } from "../data/amortization";
import { UpdateRecordInput } from "../actions/records";

const fmtC = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const inputCls = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

type Props = {
  part: AmortizationRecord;
  onClose: () => void;
  onSubmit: (updates: UpdateRecordInput) => void;
  saving?: boolean;
  error?: string | null;
  lockedCategory?: "CUSTOMER" | "VENDOR" | null;
};

export default function EditRecordModal({ part, onClose, onSubmit, saving = false, error, lockedCategory }: Props) {
  const [sopMonth, sopYearInit] = part.sop.split("-");
  const fullYear = parseInt(sopYearInit) < 100
    ? (parseInt(sopYearInit) >= 50 ? `19${sopYearInit}` : `20${sopYearInit.padStart(2, "0")}`)
    : sopYearInit;

  const [category, setCategory] = useState<"CUSTOMER" | "VENDOR">(part.category);
  const [customerVendor, setCustomerVendor] = useState(part.customerVendor);
  const [model, setModel] = useState(part.model);
  const [partName, setPartName] = useState(part.partName);
  const [selectedSopMonth, setSelectedSopMonth] = useState(sopMonth);
  const [sopYear, setSopYear] = useState(fullYear);
  const [toolingCost, setToolingCost] = useState(part.toolingCost.toString());
  const [packagingCost, setPackagingCost] = useState(part.packagingCost.toString());
  const [others, setOthers] = useState(part.others.toString());
  const [ammVol, setAmmVol] = useState(part.ammVol.toString());

  const tooling = parseFloat(toolingCost) || 0;
  const packaging = parseFloat(packagingCost) || 0;
  const othersCost = parseFloat(others) || 0;
  const volume = parseInt(ammVol) || 0;
  const ratePerUnit = tooling + packaging + othersCost;
  const totalCost = ratePerUnit * volume;

  const isValid = customerVendor.trim() && partName.trim() && sopYear.trim() && volume > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      category,
      customerVendor: customerVendor.trim(),
      model: model.trim(),
      partName: partName.trim(),
      sop: `${selectedSopMonth}-${sopYear.slice(-2)}`,
      toolingCost: tooling,
      packagingCost: packaging,
      others: othersCost,
      ammVol: volume,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">Edit Record</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{part.partNo}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form id="edit-record-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* Category */}
          <div>
            <p className={labelCls}>Category</p>
            {lockedCategory ? (
              <div className={`py-2.5 rounded-lg border text-xs font-bold text-center ${lockedCategory === "CUSTOMER" ? "bg-blue-600 border-blue-600 text-white" : "bg-orange-500 border-orange-500 text-white"}`}>
                {lockedCategory}
                <span className="ml-1.5 opacity-70 font-normal">(locked by role)</span>
              </div>
            ) : (
              <div className="flex gap-3">
                {(["CUSTOMER", "VENDOR"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                      category === c
                        ? c === "CUSTOMER" ? "bg-blue-600 border-blue-600 text-white" : "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name + model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{category === "CUSTOMER" ? "Customer" : "Vendor"} Name <span className="text-red-500">*</span></label>
              <input className={inputCls} value={customerVendor} onChange={e => setCustomerVendor(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Product Model</label>
              <input className={inputCls} value={model} onChange={e => setModel(e.target.value)} />
            </div>
          </div>

          {/* Part No (read-only) + Part Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Part No</label>
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono font-semibold text-gray-500">
                {part.partNo}
              </div>
            </div>
            <div>
              <label className={labelCls}>Part Name <span className="text-red-500">*</span></label>
              <input className={inputCls} value={partName} onChange={e => setPartName(e.target.value)} required />
            </div>
          </div>

          {/* SOP */}
          <div>
            <label className={labelCls}>Date SOP <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <select className={`${inputCls} w-auto`} value={selectedSopMonth} onChange={e => setSelectedSopMonth(e.target.value)}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
              <input
                className={inputCls}
                value={sopYear}
                onChange={e => setSopYear(e.target.value)}
                placeholder="YYYY"
                maxLength={4}
                pattern="\d{4}"
                required
              />
            </div>
          </div>

          {/* Costs */}
          <div className="border-t border-gray-100 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Cost Details (RM per unit)</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Tooling Cost</label>
                <input className={inputCls} type="number" min="0" step="0.01" value={toolingCost} onChange={e => setToolingCost(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className={labelCls}>Packaging Cost</label>
                <input className={inputCls} type="number" min="0" step="0.01" value={packagingCost} onChange={e => setPackagingCost(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className={labelCls}>Others</label>
                <input className={inputCls} type="number" min="0" step="0.01" value={others} onChange={e => setOthers(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Total Volume Amortization (Qty) <span className="text-red-500">*</span></label>
              <input className={inputCls} type="number" min="1" step="1" value={ammVol} onChange={e => setAmmVol(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Total Cost Investment (RM)</label>
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-900">
                {totalCost > 0 ? fmtC(totalCost) : <span className="text-gray-400 font-normal">Auto-calculated</span>}
              </div>
              {totalCost > 0 && (
                <p className="text-[10px] text-gray-500 mt-1">{fmtC(ratePerUnit)} / unit × {volume.toLocaleString()} units</p>
              )}
            </div>
          </div>

          {/* Warning if ammVol < totalQtyDel */}
          {volume > 0 && volume < part.totalQtyDel && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs font-bold text-amber-800">Warning: Volume ({volume.toLocaleString()}) is less than qty already delivered ({part.totalQtyDel.toLocaleString()})</p>
              <p className="text-[11px] text-amber-700 mt-0.5">Balance Qty will be negative. Make sure this is intentional.</p>
            </div>
          )}

        </form>

        <div className="px-6 py-4 border-t border-gray-100 space-y-3">
          {error && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              form="edit-record-form"
              disabled={!isValid || saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
