"use client";

import { useRef, useState } from "react";
import { importRecords, ImportRecordsResult } from "../actions/records";
import { parseAmortizationExcel } from "../lib/importAmortizationExcel";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ImportExcelModal({ onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportRecordsResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setResult(null);
    setParseErrors([]);
    setParseWarnings([]);
    setRowCount(null);
    setPendingFile(null);
    setFileName(null);

    if (!file) return;

    setFileName(file.name);
    const parsed = await parseAmortizationExcel(file);
    setParseErrors(parsed.errors);
    setParseWarnings(parsed.warnings);
    setRowCount(parsed.records.length);
    if (parsed.errors.length === 0 && parsed.records.length > 0) {
      setPendingFile(file);
    }
  }

  async function handleImport() {
    if (!pendingFile) return;
    setImporting(true);
    setResult(null);
    try {
      const parsed = await parseAmortizationExcel(pendingFile);
      if (parsed.errors.length > 0 || parsed.records.length === 0) {
        setParseErrors(parsed.errors.length ? parsed.errors : ["No valid records to import."]);
        return;
      }
      const importResult = await importRecords(parsed.records);
      setResult(importResult);
      if (importResult.created + importResult.updated > 0) {
        onSuccess();
      }
    } finally {
      setImporting(false);
    }
  }

  const done = result != null && result.errors.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Import Excel</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              2 header rows, data below. Years ≥ 2026 include monthly columns (JAN–DEC).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Close"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-sm font-semibold text-gray-800">
              {fileName ? fileName : "Choose an .xlsx file"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Click to browse</p>
          </div>

          {rowCount != null && parseErrors.length === 0 && (
            <p className="text-sm text-gray-700">
              Found <span className="font-bold text-gray-900">{rowCount}</span> part
              {rowCount === 1 ? "" : "s"} to import. Existing parts match by <span className="font-mono text-xs">PART NO</span> and will be updated.
            </p>
          )}

          {parseWarnings.map((w) => (
            <p key={w} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {w}
            </p>
          ))}

          {parseErrors.length > 0 && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-h-32 overflow-y-auto space-y-1">
              {parseErrors.map((err) => (
                <p key={err}>{err}</p>
              ))}
            </div>
          )}

          {result && (
            <div
              className={`text-xs rounded-lg px-3 py-2 border ${
                result.errors.length
                  ? "text-amber-800 bg-amber-50 border-amber-200"
                  : "text-emerald-800 bg-emerald-50 border-emerald-200"
              }`}
            >
              {result.created > 0 && <p>{result.created} record(s) created.</p>}
              {result.updated > 0 && <p>{result.updated} record(s) updated.</p>}
              {result.errors.map((err) => (
                <p key={err} className="text-red-700">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            {done ? "Close" : "Cancel"}
          </button>
          {!done && (
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !pendingFile || parseErrors.length > 0}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
