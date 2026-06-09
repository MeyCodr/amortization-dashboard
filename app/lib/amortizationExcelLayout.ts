export const STATIC_HEADERS = [
  "CATEGORY",
  "CUSTOMER/VENDOR",
  "MODEL",
  "PART NO",
  "PART NAME",
  "SOP",
  "TOOLING COST",
  "PACKAGING COST",
  "OTHERS",
  "AMM. VOL",
  "TOTAL COST",
] as const;

export const YEAR_SUB_HEADERS = ["QTY DEL", "INVESTMENT RECOVERED", "BALANCE INVESTMENT"] as const;
export const MONTH_HEADERS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;
export const SUMMARY_HEADERS = ["REMARKS", "TOTAL QTY DEL", "TOTAL BAL QTY", "TOTAL INVESTMENT"] as const;

export const STATIC_COL_COUNT = STATIC_HEADERS.length;
export const YEAR_SUB_COL_COUNT = YEAR_SUB_HEADERS.length;
export const MONTH_COL_COUNT = MONTH_HEADERS.length;
export const SUMMARY_COL_COUNT = SUMMARY_HEADERS.length;

/** Years from this value onward get per-month columns after the standard 3-column block. */
export const MONTHLY_YEAR_THRESHOLD = 2026;

export const YEAR_HEADER_FILLS = ["FFBDD7EE", "FFF8CBAD", "FFFFE699", "FFC6E0B4", "FFE1BEE7", "FFD9D9D9"];

export function normalizeHeader(value: string): string {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

export function isYearLabel(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function isMonthlyYear(year: string): boolean {
  return parseInt(year, 10) >= MONTHLY_YEAR_THRESHOLD;
}

/** Total columns occupied by one year block (3 for historical, 15 for monthly years). */
export function yearColWidth(year: string): number {
  return isMonthlyYear(year) ? YEAR_SUB_COL_COUNT + MONTH_COL_COUNT : YEAR_SUB_COL_COUNT;
}

/** Header text variants for static columns (index matches STATIC_HEADERS). */
export const STATIC_HEADER_ALIASES: Record<number, string[]> = {
  9: ["AMM. VOL", "AMM.VOL", "AMM VOL"],
};
