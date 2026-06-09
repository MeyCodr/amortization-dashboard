import ExcelJS from "exceljs";
import { AmortizationRecord, YearData } from "../data/amortization";
import {
  MONTH_HEADERS,
  STATIC_COL_COUNT,
  STATIC_HEADER_ALIASES,
  STATIC_HEADERS,
  SUMMARY_HEADERS,
  YEAR_SUB_COL_COUNT,
  YEAR_SUB_HEADERS,
  isMonthlyYear,
  isYearLabel,
  normalizeHeader,
} from "./amortizationExcelLayout";

export type ParseExcelResult = {
  records: AmortizationRecord[];
  errors: string[];
  warnings: string[];
};

function getRawCellValue(cell: ExcelJS.Cell): unknown {
  const v = cell.value;
  if (v == null) return null;
  if (typeof v !== "object") return v;
  if ("formula" in v || "sharedFormula" in v) {
    return (v as ExcelJS.CellFormulaValue).result ?? null;
  }
  if ("richText" in v) {
    return (v as ExcelJS.CellRichTextValue).richText.map((t) => t.text).join("");
  }
  if ("hyperlink" in v) {
    const link = v as ExcelJS.CellHyperlinkValue;
    return link.text ?? "";
  }
  if (v instanceof Date) return v;
  return v;
}

function cellText(cell: ExcelJS.Cell): string {
  const v = getRawCellValue(cell);
  if (v == null) return "";
  if (v instanceof Date) {
    return v.toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", "-");
  }
  return String(v).trim();
}

function cellNumber(cell: ExcelJS.Cell): number {
  const v = getRawCellValue(cell);
  if (v == null || v === "" || v === "-") return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function findHeaderRow(sheet: ExcelJS.Worksheet): number | null {
  for (let r = 1; r <= Math.min(10, sheet.rowCount); r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= Math.min(row.cellCount, 40); c++) {
      if (normalizeHeader(cellText(row.getCell(c))) === "PART NO") return r;
    }
  }
  return null;
}

function buildStaticColumnMap(headerRow: ExcelJS.Row): Map<number, number> {
  const map = new Map<number, number>();
  headerRow.eachCell({ includeEmpty: false }, (cell, col) => {
    const label = normalizeHeader(cellText(cell));
    let idx = STATIC_HEADERS.findIndex((h) => h === label);
    if (idx < 0) {
      for (const [fieldIdx, aliases] of Object.entries(STATIC_HEADER_ALIASES)) {
        if (aliases.some((a) => normalizeHeader(a) === label)) {
          idx = Number(fieldIdx);
          break;
        }
      }
    }
    if (idx >= 0) map.set(idx, col);
  });
  return map;
}

type MergeRange = { top: number; left: number; bottom: number; right: number };

function columnLettersToNumber(letters: string): number {
  let n = 0;
  for (const ch of letters.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

function parseA1Cell(address: string): { row: number; col: number } {
  const match = /^([A-Z]+)(\d+)$/i.exec(address.trim());
  if (!match) return { row: 1, col: 1 };
  return { row: parseInt(match[2], 10), col: columnLettersToNumber(match[1]) };
}

function getMergeRanges(sheet: ExcelJS.Worksheet): MergeRange[] {
  const merges =
    (sheet as unknown as { model?: { merges?: string[] } }).model?.merges ?? [];
  return merges.map((ref) => {
    const [start, end] = ref.split(":");
    const s = parseA1Cell(start);
    const e = end ? parseA1Cell(end) : s;
    return {
      top: Math.min(s.row, e.row),
      left: Math.min(s.col, e.col),
      bottom: Math.max(s.row, e.row),
      right: Math.max(s.col, e.col),
    };
  });
}

function parseYearFromCell(cell: ExcelJS.Cell): string | null {
  const v = getRawCellValue(cell);
  if (v == null || v === "") return null;

  if (typeof v === "number") {
    if (Number.isInteger(v) && v >= 1990 && v <= 2100) return String(v);
    if (v > 20000 && v < 60000) {
      const utcDays = Math.floor(v - 25569);
      const d = new Date(utcDays * 86400000);
      if (!Number.isNaN(d.getTime())) {
        const y = d.getUTCFullYear();
        if (y >= 1990 && y <= 2100) return String(y);
      }
    }
  }

  const text = String(v).trim();
  if (isYearLabel(text)) return text;
  const fy = text.match(/^(?:FY)?\s*(\d{4})$/i);
  if (fy) return fy[1];

  return null;
}

type YearSpan = { year: string; left: number; right: number };

function buildYearSpans(sheet: ExcelJS.Worksheet, headerRowNum: number): YearSpan[] {
  const spans: YearSpan[] = [];

  for (const merge of getMergeRanges(sheet)) {
    if (merge.bottom >= headerRowNum) continue;
    const year = parseYearFromCell(sheet.getRow(merge.top).getCell(merge.left));
    if (year) spans.push({ year, left: merge.left, right: merge.right });
  }

  if (spans.length === 0) {
    for (let r = 1; r < headerRowNum; r++) {
      for (let c = 1; c <= 120; c++) {
        const year = parseYearFromCell(sheet.getRow(r).getCell(c));
        if (!year) continue;
        const covered = spans.some((s) => c >= s.left && c <= s.right);
        if (!covered) spans.push({ year, left: c, right: c + 2 });
      }
    }
  }

  return spans.sort((a, b) => a.left - b.left);
}

function collectYearsLeftToRight(
  sheet: ExcelJS.Worksheet,
  headerRowNum: number,
  maxCol: number
): string[] {
  const years: string[] = [];
  let lastYear = "";

  for (let r = 1; r < headerRowNum; r++) {
    for (let c = 1; c <= maxCol; c++) {
      const year = parseYearFromCell(sheet.getRow(r).getCell(c));
      if (year && year !== lastYear) {
        years.push(year);
        lastYear = year;
      }
    }
  }

  return years;
}

function yearForTripletCol(spans: YearSpan[], col: number): string | null {
  const span = spans.find((s) => col >= s.left && col <= s.right);
  return span?.year ?? null;
}

function isYearTriplet(headerRow: ExcelJS.Row, col: number): boolean {
  const h0 = normalizeHeader(cellText(headerRow.getCell(col)));
  const h1 = normalizeHeader(cellText(headerRow.getCell(col + 1)));
  const h2 = normalizeHeader(cellText(headerRow.getCell(col + 2)));
  return (
    h0 === normalizeHeader(YEAR_SUB_HEADERS[0]) &&
    h1 === normalizeHeader(YEAR_SUB_HEADERS[1]) &&
    h2 === normalizeHeader(YEAR_SUB_HEADERS[2])
  );
}

/** Detect whether the 12 month columns (JAN..DEC) start at `startCol`. */
function detectMonthCols(headerRow: ExcelJS.Row, startCol: number): Record<string, number> | undefined {
  for (let i = 0; i < MONTH_HEADERS.length; i++) {
    if (normalizeHeader(cellText(headerRow.getCell(startCol + i))) !== MONTH_HEADERS[i]) return undefined;
  }
  const cols: Record<string, number> = {};
  MONTH_HEADERS.forEach((m, i) => { cols[m] = startCol + i; });
  return cols;
}

type YearMeta = {
  year: string;
  qtyCol: number;
  invCol: number;
  balCol: number;
  monthCols?: Record<string, number>;
};

function parseYears(
  sheet: ExcelJS.Worksheet,
  headerRowNum: number,
  headerRow: ExcelJS.Row
): YearMeta[] {
  const maxCol = Math.max(headerRow.cellCount, 120);
  const triplets: number[] = [];

  for (let col = 1; col <= maxCol; col++) {
    const h0 = normalizeHeader(cellText(headerRow.getCell(col)));
    if (SUMMARY_HEADERS.some((h) => normalizeHeader(h) === h0)) break;
    if (!isYearTriplet(headerRow, col)) continue;
    triplets.push(col);
    col += 2;
  }

  const spans = buildYearSpans(sheet, headerRowNum);
  const yearsOrdered = collectYearsLeftToRight(sheet, headerRowNum, maxCol);

  const assign = (col: number, i: number): string | null => {
    const fromSpan = yearForTripletCol(spans, col);
    if (fromSpan) return fromSpan;
    if (yearsOrdered.length === triplets.length) return yearsOrdered[i];
    if (spans.length === triplets.length) return spans[i].year;
    return null;
  };

  const result: YearMeta[] = [];

  // Pass 1: standard QTY DEL / INV REC / BAL INV triplets (historical years)
  for (let i = 0; i < triplets.length; i++) {
    const col = triplets[i];
    const year = assign(col, i);
    if (!year) continue;
    const base: YearMeta = { year, qtyCol: col, invCol: col + 1, balCol: col + 2 };
    if (isMonthlyYear(year)) {
      base.monthCols = detectMonthCols(headerRow, col + YEAR_SUB_COL_COUNT);
    }
    result.push(base);
  }

  // Pass 2: months-first layout — JAN…DEC appear first within the year span,
  // followed by TOTAL / INVESTMENT RECOVERED / BALANCE INVESTMENT columns.
  // This handles external Excel formats where monthly columns lead the year block.
  const assignedYears = new Set(result.map((r) => r.year));
  for (const span of spans) {
    if (assignedYears.has(span.year)) continue;
    for (let col = span.left; col <= span.right; col++) {
      const monthCols = detectMonthCols(headerRow, col);
      if (monthCols) {
        const afterMonths = col + MONTH_HEADERS.length;
        result.push({
          year: span.year,
          qtyCol: afterMonths,
          invCol: afterMonths + 1,
          balCol: afterMonths + 2,
          monthCols,
        });
        assignedYears.add(span.year);
        break;
      }
    }
  }

  return result.sort((a, b) => a.year.localeCompare(b.year));
}

function findSummaryColumns(headerRow: ExcelJS.Row): { totalQtyCol?: number; totalBalCol?: number } {
  let totalQtyCol: number | undefined;
  let totalBalCol: number | undefined;
  headerRow.eachCell({ includeEmpty: false }, (cell, col) => {
    const label = normalizeHeader(cellText(cell));
    if (label === normalizeHeader(SUMMARY_HEADERS[1])) totalQtyCol = col;
    if (label === normalizeHeader(SUMMARY_HEADERS[2])) totalBalCol = col;
  });
  return { totalQtyCol, totalBalCol };
}

function parseCategory(raw: string): "CUSTOMER" | "VENDOR" | null {
  const v = normalizeHeader(raw);
  if (v === "CUSTOMER") return "CUSTOMER";
  if (v === "VENDOR") return "VENDOR";
  return null;
}

function readStaticField(
  row: ExcelJS.Row,
  colMap: Map<number, number>,
  fieldIndex: number,
  kind: "text" | "number"
): string | number {
  const col = colMap.get(fieldIndex);
  if (!col) return kind === "number" ? 0 : "";
  const cell = row.getCell(col);
  return kind === "number" ? cellNumber(cell) : cellText(cell);
}

export async function parseAmortizationExcel(file: File): Promise<ParseExcelResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const records: AmortizationRecord[] = [];

  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { records: [], errors: ["Workbook has no worksheets."], warnings };
  }

  const headerRowNum = findHeaderRow(sheet);
  if (!headerRowNum) {
    return {
      records: [],
      errors: ['Could not find a header row containing "PART NO". Use the export template layout.'],
      warnings,
    };
  }

  const headerRow = sheet.getRow(headerRowNum);
  const staticColMap = buildStaticColumnMap(headerRow);
  if (!staticColMap.has(3)) {
    return { records: [], errors: ["Missing required column: PART NO"], warnings };
  }

  const yearColumns = parseYears(sheet, headerRowNum, headerRow);
  if (yearColumns.length === 0) {
    return {
      records: [],
      errors: [
        'No year columns found. Ensure merged year headers (e.g. 2023, 2024, 2025, 2026) sit above either "QTY DEL / INVESTMENT RECOVERED / BALANCE INVESTMENT" columns or monthly "JAN … DEC" columns.',
      ],
      warnings,
    };
  }

  const { totalQtyCol, totalBalCol } = findSummaryColumns(headerRow);
  const dataStartRow = headerRowNum + 1;

  for (let r = dataStartRow; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const partNo = String(readStaticField(row, staticColMap, 3, "text"));
    if (!partNo) continue;

    const rowLabel = `Row ${r} (${partNo})`;
    const categoryRaw = String(readStaticField(row, staticColMap, 0, "text"));
    const category = parseCategory(categoryRaw);
    if (!category) {
      errors.push(`${rowLabel}: invalid CATEGORY "${categoryRaw}" (expected CUSTOMER or VENDOR).`);
      continue;
    }

    const toolingCost = Number(readStaticField(row, staticColMap, 6, "number"));
    const packagingCost = Number(readStaticField(row, staticColMap, 7, "number"));
    const others = Number(readStaticField(row, staticColMap, 8, "number"));
    const ammVol = Math.round(Number(readStaticField(row, staticColMap, 9, "number")));
    const ratePerUnit = toolingCost + packagingCost + others;
    let totalCost = Number(readStaticField(row, staticColMap, 10, "number"));
    if (totalCost <= 0 && ammVol > 0) totalCost = ratePerUnit * ammVol;

    const years: Record<string, YearData> = {};

    for (const { year, qtyCol, invCol, balCol, monthCols } of yearColumns) {
      let qtyDel = Math.round(cellNumber(row.getCell(qtyCol)));
      let investmentRecovered = cellNumber(row.getCell(invCol));
      const balanceInvestment = cellNumber(row.getCell(balCol));

      let months: Record<string, number> | undefined;
      if (monthCols) {
        months = {};
        let monthSum = 0;
        for (const [m, col] of Object.entries(monthCols)) {
          const v = Math.round(cellNumber(row.getCell(col)));
          months[m] = v;
          monthSum += v;
        }
        // If the annual cell is empty but months have data, derive qtyDel from months
        if (qtyDel === 0 && monthSum > 0) qtyDel = monthSum;
      }

      if (investmentRecovered <= 0 && qtyDel > 0 && ratePerUnit > 0) {
        investmentRecovered = qtyDel * ratePerUnit;
      }

      years[year] = { qtyDel, investmentRecovered, balanceInvestment, ...(months ? { months } : {}) };
    }

    const totalQtyDel =
      totalQtyCol != null
        ? Math.round(cellNumber(row.getCell(totalQtyCol)))
        : Object.values(years).reduce((s, y) => s + y.qtyDel, 0);

    const totalBalQty =
      totalBalCol != null
        ? Math.round(cellNumber(row.getCell(totalBalCol)))
        : ammVol - totalQtyDel;

    records.push({
      id: partNo,
      category,
      customerVendor: String(readStaticField(row, staticColMap, 1, "text")),
      model: String(readStaticField(row, staticColMap, 2, "text")),
      partNo,
      partName: String(readStaticField(row, staticColMap, 4, "text")),
      sop: String(readStaticField(row, staticColMap, 5, "text")),
      toolingCost,
      packagingCost,
      others,
      ammVol,
      totalCost,
      years,
      totalQtyDel,
      totalBalQty,
    });
  }

  if (records.length === 0 && errors.length === 0) {
    warnings.push("No data rows found below the header.");
  }

  return { records, errors, warnings };
}
