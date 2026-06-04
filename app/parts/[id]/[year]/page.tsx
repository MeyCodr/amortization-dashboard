import { notFound } from "next/navigation";
import { getPartById } from "../../../actions/records";
import MonthlyPageClient from "./MonthlyPageClient";
import { MONTH_ORDER } from "../../../data/amortization";

export default async function MonthlyBreakdownPage({
  params,
}: {
  params: Promise<{ id: string; year: string }>;
}) {
  const { id, year } = await params;
  const part = await getPartById(id);
  if (!part) notFound();

  const yearData = part.years[year] ?? null;

  // Build initial months map: stored months or all zeros
  const rawMonths = yearData?.months ?? {};
  const initialMonths: Record<string, number> = Object.fromEntries(
    MONTH_ORDER.map((m) => [m, rawMonths[m] ?? 0])
  );

  // existingAnnualQty: annual total recorded WITHOUT a monthly breakdown.
  // Used to show a reconciliation notice so users know what the total should add up to.
  const existingAnnualQty =
    yearData && !yearData.months && yearData.qtyDel > 0 ? yearData.qtyDel : null;

  return (
    <MonthlyPageClient
      part={part}
      year={year}
      initialMonths={initialMonths}
      existingAnnualQty={existingAnnualQty}
    />
  );
}
