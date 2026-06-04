import ExcelJS from "exceljs";
import { AmortizationRecord } from "../data/amortization";
import {
  MONTH_COL_COUNT,
  MONTH_HEADERS,
  STATIC_COL_COUNT,
  STATIC_HEADERS,
  SUMMARY_COL_COUNT,
  SUMMARY_HEADERS,
  YEAR_HEADER_FILLS,
  YEAR_SUB_COL_COUNT,
  YEAR_SUB_HEADERS,
  isMonthlyYear,
  yearColWidth,
} from "./amortizationExcelLayout";

const DATA_FONT: Partial<ExcelJS.Font> = { size: 10, name: "Calibri" };
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFB0B0B0" } },
  left: { style: "thin", color: { argb: "FFB0B0B0" } },
  bottom: { style: "thin", color: { argb: "FFB0B0B0" } },
  right: { style: "thin", color: { argb: "FFB0B0B0" } },
};

function collectYears(records: AmortizationRecord[]): string[] {
  const set = new Set<string>();
  for (const r of records) {
    for (const y of Object.keys(r.years)) set.add(y);
  }
  return [...set].sort();
}

function styleCell(
  cell: ExcelJS.Cell,
  opts: {
    fill?: string;
    bold?: boolean;
    align?: Partial<ExcelJS.Alignment>;
    numFmt?: string;
  } = {}
) {
  cell.font = { ...DATA_FONT, ...(opts.bold ? { bold: true } : {}) };
  cell.border = THIN_BORDER;
  if (opts.fill) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: opts.fill } };
  }
  if (opts.align) cell.alignment = opts.align;
  if (opts.numFmt) cell.numFmt = opts.numFmt;
}

function investmentDisplay(value: number): number | string {
  return value === 0 ? "-" : value;
}

export async function exportAmortizationToExcel(
  records: AmortizationRecord[],
  filename = `Part-Level-Amortization-Records-${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  const years = collectYears(records);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PHN Manufacturing";
  const sheet = workbook.addWorksheet("Amortization Records", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  // Pre-compute each year's starting column
  const yearFirstCol: Record<string, number> = {};
  let curCol = STATIC_COL_COUNT + 1;
  for (const year of years) {
    yearFirstCol[year] = curCol;
    curCol += yearColWidth(year);
  }
  const summaryStartCol = curCol;

  // ── Row 1: year group headers (merged) ──────────────────────────────────
  for (let i = 0; i < STATIC_COL_COUNT; i++) {
    styleCell(sheet.getCell(1, i + 1), { fill: "FFF2F2F2", bold: true });
  }
  years.forEach((year, yi) => {
    const startCol = yearFirstCol[year];
    const width = yearColWidth(year);
    sheet.mergeCells(1, startCol, 1, startCol + width - 1);
    const cell = sheet.getCell(1, startCol);
    cell.value = year;
    const fill = YEAR_HEADER_FILLS[yi % YEAR_HEADER_FILLS.length];
    styleCell(cell, { fill, bold: true, align: { horizontal: "center", vertical: "middle" } });
  });
  for (let i = 0; i < SUMMARY_COL_COUNT; i++) {
    styleCell(sheet.getCell(1, summaryStartCol + i), { fill: "FFF2F2F2", bold: true });
  }

  // ── Row 2: column sub-headers ────────────────────────────────────────────
  STATIC_HEADERS.forEach((label, i) => {
    const cell = sheet.getCell(2, i + 1);
    cell.value = label;
    styleCell(cell, {
      fill: "FFF2F2F2",
      bold: true,
      align: { horizontal: "center", vertical: "middle", wrapText: true },
    });
  });
  years.forEach((year, yi) => {
    const fill = YEAR_HEADER_FILLS[yi % YEAR_HEADER_FILLS.length];
    const startCol = yearFirstCol[year];
    if (isMonthlyYear(year)) {
      // Months-first: JAN…DEC | TOTAL | INVESTMENT RECOVERED | BALANCE INVESTMENT
      MONTH_HEADERS.forEach((month, mi) => {
        const cell = sheet.getCell(2, startCol + mi);
        cell.value = month;
        styleCell(cell, { fill, bold: true, align: { horizontal: "center", vertical: "middle", wrapText: true } });
      });
      ["TOTAL", YEAR_SUB_HEADERS[1], YEAR_SUB_HEADERS[2]].forEach((label, si) => {
        const cell = sheet.getCell(2, startCol + MONTH_COL_COUNT + si);
        cell.value = label;
        styleCell(cell, { fill, bold: true, align: { horizontal: "center", vertical: "middle", wrapText: true } });
      });
    } else {
      YEAR_SUB_HEADERS.forEach((label, si) => {
        const cell = sheet.getCell(2, startCol + si);
        cell.value = label;
        styleCell(cell, { fill, bold: true, align: { horizontal: "center", vertical: "middle", wrapText: true } });
      });
    }
  });
  SUMMARY_HEADERS.forEach((label, i) => {
    const cell = sheet.getCell(2, summaryStartCol + i);
    cell.value = label;
    styleCell(cell, {
      fill: "FFF2F2F2",
      bold: true,
      align: { horizontal: "center", vertical: "middle", wrapText: true },
    });
  });

  // ── Data rows ────────────────────────────────────────────────────────────
  records.forEach((record, rowIndex) => {
    const row = rowIndex + 3;
    const staticValues: (string | number)[] = [
      record.category,
      record.customerVendor,
      record.model,
      record.partNo,
      record.partName,
      record.sop,
      record.toolingCost,
      record.packagingCost,
      record.others,
      record.ammVol,
      record.totalCost,
    ];

    staticValues.forEach((value, colIndex) => {
      const cell = sheet.getCell(row, colIndex + 1);
      cell.value = value;
      const isMoney = colIndex >= 6 && colIndex <= 8;
      const isInt = colIndex === 9;
      const isTotalCost = colIndex === 10;
      styleCell(cell, {
        align: { horizontal: colIndex <= 4 ? "left" : "right", vertical: "middle" },
        numFmt: isMoney ? "#,##0.00" : isInt ? "#,##0" : isTotalCost ? "#,##0.00" : undefined,
      });
    });

    years.forEach((year, yi) => {
      const yData = record.years[year];
      const startCol = yearFirstCol[year];
      const fill = yi % 2 === 0 ? "FFFFFFFF" : "FFFAFAFA";

      if (isMonthlyYear(year)) {
        // Months-first: JAN…DEC | TOTAL | INV REC | BAL INV
        MONTH_HEADERS.forEach((month, mi) => {
          const cell = sheet.getCell(row, startCol + mi);
          cell.value = yData?.months?.[month] ?? 0;
          styleCell(cell, { fill, align: { horizontal: "right", vertical: "middle" }, numFmt: "#,##0" });
        });
        const totalCell = sheet.getCell(row, startCol + MONTH_COL_COUNT);
        totalCell.value = yData?.qtyDel ?? 0;
        styleCell(totalCell, { fill, align: { horizontal: "right", vertical: "middle" }, numFmt: "#,##0" });
        const invCell = sheet.getCell(row, startCol + MONTH_COL_COUNT + 1);
        invCell.value = yData ? investmentDisplay(yData.investmentRecovered) : "-";
        styleCell(invCell, { fill, align: { horizontal: "right", vertical: "middle" }, numFmt: typeof invCell.value === "number" ? "#,##0.00" : undefined });
        const balCell = sheet.getCell(row, startCol + MONTH_COL_COUNT + 2);
        balCell.value = yData?.balanceInvestment ?? 0;
        styleCell(balCell, { fill, align: { horizontal: "right", vertical: "middle" }, numFmt: "#,##0.00" });
        return;
      }

      if (!yData) {
        for (let si = 0; si < YEAR_SUB_COL_COUNT; si++) {
          const cell = sheet.getCell(row, startCol + si);
          cell.value = si === 0 ? 0 : "-";
          styleCell(cell, { fill, align: { horizontal: "right", vertical: "middle" }, numFmt: si === 0 ? "#,##0" : undefined });
        }
        return;
      }

      const qtyCell = sheet.getCell(row, startCol);
      qtyCell.value = yData.qtyDel;
      styleCell(qtyCell, { fill, align: { horizontal: "right", vertical: "middle" }, numFmt: "#,##0" });

      const invCell = sheet.getCell(row, startCol + 1);
      invCell.value = investmentDisplay(yData.investmentRecovered);
      styleCell(invCell, {
        fill,
        align: { horizontal: "right", vertical: "middle" },
        numFmt: typeof invCell.value === "number" ? "#,##0.00" : undefined,
      });

      const balCell = sheet.getCell(row, startCol + 2);
      balCell.value = yData.balanceInvestment;
      styleCell(balCell, { fill, align: { horizontal: "right", vertical: "middle" }, numFmt: "#,##0.00" });
    });

    const totalQtyCell = sheet.getCell(row, summaryStartCol);
    totalQtyCell.value = record.totalQtyDel;
    styleCell(totalQtyCell, { fill: "FFFFFFFF", align: { horizontal: "right", vertical: "middle" }, numFmt: "#,##0" });

    const totalBalCell = sheet.getCell(row, summaryStartCol + 1);
    totalBalCell.value = record.totalBalQty;
    styleCell(totalBalCell, { fill: "FFFFFFFF", align: { horizontal: "right", vertical: "middle" }, numFmt: "#,##0" });
  });

  // ── Column widths ────────────────────────────────────────────────────────
  const staticWidths = [12, 18, 12, 22, 28, 10, 14, 16, 10, 12, 14];
  staticWidths.forEach((w, i) => { sheet.getColumn(i + 1).width = w; });
  for (let c = STATIC_COL_COUNT + 1; c < summaryStartCol + SUMMARY_COL_COUNT; c++) {
    sheet.getColumn(c).width = 14;
  }

  sheet.getRow(1).height = 22;
  sheet.getRow(2).height = 36;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
