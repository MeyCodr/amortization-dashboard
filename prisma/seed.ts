import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { amortizationData } from "../app/data/amortization";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed default IT admin user (skip if already exists)
  const adminEmail = "admin@phn.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash("Admin@1234", 10);
    await prisma.user.create({
      data: { name: "Admin", email: adminEmail, password: hashed, role: "IT", status: "ACTIVE" },
    });
    console.log("Created default admin user: admin@phn.com / Admin@1234");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  for (const record of amortizationData) {
    const existing = await prisma.part.findUnique({ where: { id: record.id } });
    if (existing) {
      console.log(`Skipping existing: ${record.partNo}`);
      continue;
    }

    await prisma.part.create({
      data: {
        id: record.id,
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
        yearRecords: {
          create: Object.entries(record.years).map(([year, y]) => ({
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
          })),
        },
      },
    });
    console.log(`Seeded: ${record.partNo}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
