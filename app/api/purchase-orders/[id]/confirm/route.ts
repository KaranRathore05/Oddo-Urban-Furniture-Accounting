import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({ where: { id } });

  if (!po) {
    return NextResponse.json(
      { error: "Purchase order not found" },
      { status: 404 },
    );
  }

  if (po.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only DRAFT orders can be confirmed" },
      { status: 400 },
    );
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CONFIRMED" },
    include: { vendor: true, lines: { include: { product: true } } },
  });

  return NextResponse.json(updated);
}
