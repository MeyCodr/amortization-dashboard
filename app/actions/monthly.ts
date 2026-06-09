"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/db";
import { verifySession } from "../lib/dal";

export async function saveMonthlyData(
  partId: string,
  year: string,
  months: Record<string, number>
): Promise<void> {
  const session = await verifySession();
  if (session.role === "USER") throw new Error("Forbidden: view-only role.");
  if (!/^\d{4}$/.test(year)) throw new Error("Invalid year format.");
  if (typeof partId !== "string" || !partId.trim()) throw new Error("Invalid part ID.");

  const currentYear = new Date().getFullYear().toString();
  if (year !== currentYear) throw new Error("Monthly deliveries can only be edited for the current year.");

  const part = await prisma.part.findUnique({
    where: { id: partId },
    include: {
      yearRecords: {
        include: { monthlyRecords: true },
        orderBy: { year: "asc" },
      },
    },
  });
  if (!part) return;

  let yearRecord = part.yearRecords.find((y) => y.year === year);

  const ratePerUnit = part.toolingCost + part.packagingCost + part.others;
  const newYearQty = Object.values(months).reduce((s, v) => s + v, 0);

  // Create the year record if it doesn't exist yet
  if (!yearRecord) {
    yearRecord = await prisma.yearRecord.create({
      data: {
        year,
        qtyDel: 0,
        investmentRecovered: 0,
        balanceInvestment: part.totalCost,
        partId: part.id,
        monthlyRecords: { create: [] },
      },
      include: { monthlyRecords: true },
    });
    // Reload full part so the new year is included in balance recalculation
    const refreshed = await prisma.part.findUnique({
      where: { id: partId },
      include: { yearRecords: { include: { monthlyRecords: true }, orderBy: { year: "asc" } } },
    });
    if (!refreshed) return;
    Object.assign(part, refreshed);
  }

  // Replace monthly records for this year
  await prisma.monthlyRecord.deleteMany({ where: { yearRecordId: yearRecord.id } });
  const nonZeroMonths = Object.entries(months).filter(([, qty]) => qty > 0);
  if (nonZeroMonths.length > 0) {
    await prisma.monthlyRecord.createMany({
      data: nonZeroMonths.map(([month, qty]) => ({
        month,
        qty,
        yearRecordId: yearRecord.id,
      })),
    });
  }

  // Recalculate running balance across all years
  let runningBalance = part.totalCost;
  for (const yr of part.yearRecords) {
    const qtyDel = yr.year === year ? newYearQty : yr.qtyDel;
    const investmentRecovered = qtyDel * ratePerUnit;
    runningBalance -= investmentRecovered;
    await prisma.yearRecord.update({
      where: { id: yr.id },
      data: { qtyDel, investmentRecovered, balanceInvestment: runningBalance },
    });
  }

  // Update part totals
  const totalQtyDel = part.yearRecords.reduce(
    (s, yr) => s + (yr.year === year ? newYearQty : yr.qtyDel),
    0
  );
  await prisma.part.update({
    where: { id: partId },
    data: { totalQtyDel, totalBalQty: part.ammVol - totalQtyDel },
  });

  revalidatePath(`/parts/${partId}/${year}`);
  revalidatePath(`/parts/${partId}`);
  revalidatePath("/");
}

export async function deleteMonthlyRecord(
  partId: string,
  year: string,
  month: string
): Promise<void> {
  const session = await verifySession();
  if (session.role !== "IT") throw new Error("Forbidden: only IT admins can delete monthly records.");
  if (!/^\d{4}$/.test(year)) throw new Error("Invalid year format.");
  if (typeof partId !== "string" || !partId.trim()) throw new Error("Invalid part ID.");

  const part = await prisma.part.findUnique({
    where: { id: partId },
    include: {
      yearRecords: {
        include: { monthlyRecords: true },
        orderBy: { year: "asc" },
      },
    },
  });
  if (!part) return;

  const yearRecord = part.yearRecords.find((y) => y.year === year);
  if (!yearRecord) return;

  await prisma.monthlyRecord.deleteMany({
    where: { yearRecordId: yearRecord.id, month },
  });

  const ratePerUnit = part.toolingCost + part.packagingCost + part.others;
  const remainingQty = yearRecord.monthlyRecords
    .filter((r) => r.month !== month)
    .reduce((s, r) => s + r.qty, 0);

  // Recalculate running balance across all years
  let runningBalance = part.totalCost;
  for (const yr of part.yearRecords) {
    const qtyDel = yr.year === year ? remainingQty : yr.qtyDel;
    const investmentRecovered = qtyDel * ratePerUnit;
    runningBalance -= investmentRecovered;
    await prisma.yearRecord.update({
      where: { id: yr.id },
      data: { qtyDel, investmentRecovered, balanceInvestment: runningBalance },
    });
  }

  const totalQtyDel = part.yearRecords.reduce(
    (s, yr) => s + (yr.year === year ? remainingQty : yr.qtyDel),
    0
  );
  await prisma.part.update({
    where: { id: partId },
    data: { totalQtyDel, totalBalQty: part.ammVol - totalQtyDel },
  });

  revalidatePath(`/parts/${partId}/${year}`);
  revalidatePath(`/parts/${partId}`);
  revalidatePath("/");
}
