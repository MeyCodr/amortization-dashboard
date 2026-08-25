/**
 * One-off backfill: regenerates the `id` for any Part row whose id contains
 * characters unsafe for a Next.js /parts/[id] route segment (e.g. "/", "?",
 * "#", "%", whitespace) — a leftover from when Part.id was set to the raw
 * part number. Run this once against an environment after deploying the
 * schema change that makes Part.id an auto-generated cuid.
 *
 * The FK from year_records.part_id -> parts.id is ON UPDATE CASCADE, so a
 * plain id update is enough — no need to recreate child rows.
 *
 * Usage: npx tsx scripts/fix-unsafe-part-ids.ts
 */
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UNSAFE = /[/?#%\s]/;

async function main() {
  const parts = await prisma.part.findMany({ select: { id: true, partNo: true } });
  const unsafe = parts.filter((p) => UNSAFE.test(p.id));

  console.log(`Found ${unsafe.length} part(s) with a URL-unsafe id.`);

  for (const part of unsafe) {
    const newId = randomUUID();
    await prisma.part.update({ where: { id: part.id }, data: { id: newId } });
    console.log(`  ${part.id}  ->  ${newId}  (${part.partNo})`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
