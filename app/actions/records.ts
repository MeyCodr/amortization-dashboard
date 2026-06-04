"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/db";
import { AmortizationRecord, YearData } from "../data/amortization";
import { verifySession } from "../lib/dal";

type PartWithRelations = Prisma.PartGetPayload<{
  include: { yearRecords: { include: { monthlyRecords: true } } };
}>;

function toRecord(part: PartWithRelations): AmortizationRecord {
  const years: Record<string, YearData> = {};
  for (const yr of part.yearRecords) {
    const months =
      yr.monthlyRecords.length > 0
        ? Object.fromEntries(yr.monthlyRecords.map((m) => [m.month, m.qty]))
        : undefined;
    years[yr.year] = {
      qtyDel: yr.qtyDel,
      investmentRecovered: yr.investmentRecovered,
      balanceInvestment: yr.balanceInvestment,
      ...(months ? { months } : {}),
    };
  }
  return {
    id: part.id,
    category: part.category as "CUSTOMER" | "VENDOR",
    customerVendor: part.customerVendor,
    model: part.model,
    partNo: part.partNo,
    partName: part.partName,
    sop: part.sop,
    toolingCost: part.toolingCost,
    packagingCost: part.packagingCost,
    others: part.others,
    ammVol: part.ammVol,
    totalCost: part.totalCost,
    totalQtyDel: part.totalQtyDel,
    totalBalQty: part.totalBalQty,
    years,
  };
}

const includeRelations = {
  include: { yearRecords: { include: { monthlyRecords: true } } },
} as const;

export async function getAllRecords(): Promise<AmortizationRecord[]> {
  const parts = await prisma.part.findMany({
    ...includeRelations,
    orderBy: { partNo: "asc" },
  });
  return parts.map(toRecord);
}

export async function getPartById(id: string): Promise<AmortizationRecord | null> {
  const part = await prisma.part.findUnique({
    where: { id },
    ...includeRelations,
  });
  return part ? toRecord(part) : null;
}

function yearRecordsCreateInput(record: AmortizationRecord) {
  return Object.entries(record.years).map(([year, y]) => ({
    year,
    qtyDel: y.qtyDel,
    investmentRecovered: y.investmentRecovered,
    balanceInvestment: y.balanceInvestment,
    ...(y.months
      ? {
          monthlyRecords: {
            create: Object.entries(y.months).map(([month, qty]) => ({
              month,
              qty,
            })),
          },
        }
      : {}),
  }));
}

function partDataInput(record: AmortizationRecord) {
  return {
    category: record.category,
    customerVendor: record.customerVendor,
    model: record.model,
    partNo: record.partNo,
    partName: record.partName,
    sop: record.sop,
    toolingCost: record.toolingCost,
    packagingCost: record.packagingCost,
    others: record.others,
    ammVol: record.ammVol,
    totalCost: record.totalCost,
    totalQtyDel: record.totalQtyDel,
    totalBalQty: record.totalBalQty,
  };
}

export type ImportRecordsResult = {
  created: number;
  updated: number;
  errors: string[];
};

export async function createRecord(record: AmortizationRecord): Promise<void> {
  const session = await verifySession();
  const { role } = session;

  if (role === "USER") throw new Error("Forbidden: view-only role.");
  if (role === "BD" && record.category !== "CUSTOMER") throw new Error("BD role can only add CUSTOMER records.");
  if (role === "PVD" && record.category !== "VENDOR") throw new Error("PVD role can only add VENDOR records.");

  await prisma.part.create({
    data: {
      id: record.id,
      ...partDataInput(record),
      yearRecords: { create: yearRecordsCreateInput(record) },
    },
  });
  revalidatePath("/");
}

export async function importRecords(records: AmortizationRecord[]): Promise<ImportRecordsResult> {
  const session = await verifySession();
  const { role } = session;

  if (role === "USER") {
    return { created: 0, updated: 0, errors: ["Forbidden: view-only role cannot import records."] };
  }

  const result: ImportRecordsResult = { created: 0, updated: 0, errors: [] };

  for (const record of records) {
    try {
      const existing = await prisma.part.findUnique({
        where: { partNo: record.partNo },
        include: { yearRecords: { include: { monthlyRecords: true } } },
      });

      if (existing) {
        // Merge: keep existing years that are NOT in the import file, overlay with imported years
        const importedYears = new Set(Object.keys(record.years));
        const keptYears = existing.yearRecords.filter((yr) => !importedYears.has(yr.year));

        const keptYearInput = keptYears.map((yr) => ({
          year: yr.year,
          qtyDel: yr.qtyDel,
          investmentRecovered: yr.investmentRecovered,
          balanceInvestment: yr.balanceInvestment,
          ...(yr.monthlyRecords.length > 0
            ? { monthlyRecords: { create: yr.monthlyRecords.map(({ month, qty }) => ({ month, qty })) } }
            : {}),
        }));

        const allYearInput = [...keptYearInput, ...yearRecordsCreateInput(record)];

        // Recompute part-level totals across merged year set
        const mergedTotalQtyDel =
          keptYears.reduce((s, yr) => s + yr.qtyDel, 0) +
          Object.values(record.years).reduce((s, y) => s + y.qtyDel, 0);
        const mergedTotalBalQty = record.ammVol - mergedTotalQtyDel;

        await prisma.$transaction([
          prisma.yearRecord.deleteMany({ where: { partId: existing.id } }),
          prisma.part.update({
            where: { id: existing.id },
            data: {
              ...partDataInput({ ...record, totalQtyDel: mergedTotalQtyDel, totalBalQty: mergedTotalBalQty }),
              yearRecords: { create: allYearInput },
            },
          }),
        ]);
        result.updated++;
      } else {
        await prisma.part.create({
          data: {
            id: record.partNo,
            ...partDataInput(record),
            yearRecords: { create: yearRecordsCreateInput(record) },
          },
        });
        result.created++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      result.errors.push(`${record.partNo}: ${message}`);
    }
  }

  revalidatePath("/");
  return result;
}
