export type YearData = {
  qtyDel: number;
  investmentRecovered: number;
  balanceInvestment: number;
  months?: Record<string, number>; // present only for in-progress years; keys are "JAN".."DEC"
};

export type AmortizationRecord = {
  id: string;
  category: "CUSTOMER" | "VENDOR";
  customerVendor: string;
  model: string;
  partNo: string;
  partName: string;
  sop: string;
  toolingCost: number;
  packagingCost: number;
  others: number;
  ammVol: number;
  totalCost: number;
  years: Record<string, YearData>;
  totalQtyDel: number;
  totalBalQty: number;
};

export const MONTH_ORDER = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] as const;

// yearlyQtyDel: a number means annual total; a Record<string,number> means monthly breakdown.
type YearQtyInput = number | Record<string, number>;

function makeRecord(
  category: "CUSTOMER" | "VENDOR",
  customerVendor: string,
  model: string,
  partNo: string,
  partName: string,
  sop: string,
  toolingCost: number,
  packagingCost: number,
  others: number,
  ammVol: number,
  yearlyQtyDel: Record<string, YearQtyInput>
): AmortizationRecord {
  const ratePerUnit = toolingCost + packagingCost + others;
  const totalCost = ratePerUnit * ammVol;

  const sortedYears = Object.keys(yearlyQtyDel).sort();
  let runningBalance = totalCost;
  const years: Record<string, YearData> = {};

  for (const year of sortedYears) {
    const input = yearlyQtyDel[year];
    let qtyDel: number;
    let months: Record<string, number> | undefined;

    if (typeof input === "number") {
      qtyDel = input;
    } else {
      months = input;
      qtyDel = Object.values(input).reduce((s, v) => s + v, 0);
    }

    const investmentRecovered = qtyDel * ratePerUnit;
    runningBalance -= investmentRecovered;
    years[year] = { qtyDel, investmentRecovered, balanceInvestment: runningBalance, ...(months ? { months } : {}) };
  }

  const totalQtyDel = Object.values(years).reduce((s, y) => s + y.qtyDel, 0);
  const totalBalQty = ammVol - totalQtyDel;

  return {
    id: partNo, category, customerVendor, model, partNo, partName, sop,
    toolingCost, packagingCost, others, ammVol, totalCost,
    years, totalQtyDel, totalBalQty,
  };
}

export const amortizationData: AmortizationRecord[] = [
  makeRecord("CUSTOMER", "HONDA", "3K6A", "61100-T86-T000-H1", "DASHBOARD UPPER COMP",               "Jun-23", 10.86, 1.31, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "61140-T86-T001-H1", "WISHIELD LWR COMP",                  "Jun-23", 16.85, 1.97, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "61500-3K6-K000-H1", "DASHBOARD LWR COMP",                 "Jun-23",  3.94, 0.00, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "63320-3K6-K001-H1", "GTR COMP R,RR PLR",                  "Jun-23", 10.06, 1.97, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "63720-3K6-K001-H1", "GTR COMP L,RR PLR",                  "Jun-23", 10.06, 1.97, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "64120-3K6-K000-H1", "PLR COMP R,FR INN",                  "Jun-23",  7.08, 1.31, 0, 27371,  { "2023": 3720,  "2024": 4860,  "2025": 2402,  "2026": { JAN:270,  FEB:240, MAR:90, APR:60,  MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "64120-3K6-K900-H1", "PLR COMP R,FR INN",                  "Jun-23",  7.08, 1.31, 0,  9124,  { "2023": 5040,  "2024": 4470,  "2025": 3240,  "2026": { JAN:270,  FEB:240, MAR:90, APR:60,  MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "64520-3K6-K000-H1", "PLR COMP L,FR INN",                  "Jun-23",  7.08, 1.31, 0, 27371,  { "2023": 3900,  "2024": 4860,  "2025": 2402,  "2026": { JAN:270,  FEB:240, MAR:90, APR:60,  MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "64520-3K6-K900-H1", "PLR COMP L,FR INN",                  "Jun-23",  7.08, 1.31, 0,  9124,  { "2023": 4840,  "2024": 4470,  "2025": 3240,  "2026": { JAN:270,  FEB:240, MAR:90, APR:60,  MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "65700-3K6-K001-H1", "C/MBR COMP,MID FLOOR",               "Jun-23", 23.09, 1.70, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "65750-3K6-K001-H1", "C/MBR COMP,RR FLOOR",                "Jun-23",  3.57, 0.65, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "HONDA", "3K6A", "66100-3K6-K000-H1", "PANEL COMP,REAR",                    "Jun-23", 38.94, 1.31, 0, 36495,  { "2023": 8760,  "2024": 9330,  "2025": 5642,  "2026": { JAN:300,  FEB:240, MAR:90, APR:361, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "ASSB",  "D54B", "53202-BZ010",        "PANEL-SSY,CTR FLOOR FR",             "Dec-25", 204.03, 0, 0, 14760,  { "2023": 0,     "2024": 0,     "2025": 120,   "2026": { JAN:1581, FEB:1275, MAR:858, APR:705, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "ASSB",  "D54B", "57605-BZ280",        "MEMBER SUB-ASSY,RR FLOOR CROSS,NO.1","Dec-25",  0.00, 0, 0, 14760,  { "2023": 0,     "2024": 0,     "2025": 140,   "2026": { JAN:1516, FEB:1280, MAR:840, APR:753, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "ASSB",  "D54B", "53209-BZ130",        "BRACE SUB-ASSY HOOD LOCK SUPPORT",   "Dec-25",  6.41, 0, 0, 14760,  { "2023": 0,     "2024": 0,     "2025": 150,   "2026": { JAN:1590, FEB:1260, MAR:840, APR:600, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "MMC",   "RV XFORCE", "M11V040ZZA",    "DRIVETRAIN MODULE",                  "Dec-25", 85.52, 0, 0, 12000,  { "2023": 0,     "2024": 0,     "2025": 140,   "2026": { JAN:83,   FEB:60,  MAR:30,  APR:89,  MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("CUSTOMER", "MMC",   "RV XFORCE", "M11V008ZZA",    "DRIVETRAIN MODULE_ULTIMATE",         "Dec-25", 85.52, 0, 0, 12000,  { "2023": 0,     "2024": 0,     "2025": 140,   "2026": { JAN:397,  FEB:411, MAR:491, APR:640, MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
  makeRecord("VENDOR",   "AMAT TEKNIK", "IRIZ/PERSONA", "PW932250", "HANGER CTR MUFFLER",             "Sep-14",  0.09, 0, 0, 300000, { "2023": 24247, "2024": 24600, "2025": 17400, "2026": { JAN:0,   FEB:600, MAR:0,   APR:0,   MAY:0, JUN:0, JUL:0, AUG:0, SEP:0, OCT:0, NOV:0, DEC:0 } }),
];

export function getSummaryStats(data: AmortizationRecord[]) {
  const totalCost = data.reduce((s, r) => s + r.totalCost, 0);

  const yearTotals: Record<string, number> = {};
  for (const record of data) {
    for (const [year, yData] of Object.entries(record.years)) {
      yearTotals[year] = (yearTotals[year] ?? 0) + yData.investmentRecovered;
    }
  }

  const totalRecovered = Object.values(yearTotals).reduce((s, v) => s + v, 0);
  const totalBalance = data.reduce((s, r) => {
    const lastYear = Object.keys(r.years).sort().at(-1);
    return s + (lastYear ? Math.max(r.years[lastYear].balanceInvestment, 0) : r.totalCost);
  }, 0);
  const totalQtyDel = data.reduce((s, r) => s + r.totalQtyDel, 0);
  const totalBalQty = data.reduce((s, r) => s + r.totalBalQty, 0);
  const totalAmmVol = data.reduce((s, r) => s + r.ammVol, 0);
  const recoveryRate = totalCost > 0 ? (totalRecovered / totalCost) * 100 : 0;

  return {
    totalCost,
    totalRecovered,
    totalBalance,
    totalQtyDel,
    totalBalQty,
    totalAmmVol,
    recoveryRate,
    totalRecords: data.length,
    yearTotals,
  };
}
