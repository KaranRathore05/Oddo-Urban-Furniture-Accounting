const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.journalEntry.count();
  console.log("Total Journal Entries:", count);

  const bills = await prisma.vendorBill.count();
  console.log("Total Vendor Bills:", bills);

  const invoices = await prisma.customerInvoice.count();
  console.log("Total Customer Invoices:", invoices);

  const pos = await prisma.purchaseOrder.count();
  console.log("Total Purchase Orders:", pos);

  const sos = await prisma.salesOrder.count();
  console.log("Total Sales Orders:", sos);

  console.log("Total Document Count:", bills + invoices + pos + sos);
}

main().finally(() => prisma.$disconnect());
