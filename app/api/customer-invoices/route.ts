import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;

  const invoices = await prisma.customerInvoice.findMany({
    where,
    include: {
      customer: true,
      so: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}
