import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const so = await prisma.salesOrder.findUnique({ where: { id } });

  if (!so) {
    return NextResponse.json(
      { error: "Sales order not found" },
      { status: 404 },
    );
  }

  if (so.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only DRAFT orders can be confirmed" },
      { status: 400 },
    );
  }

  const updated = await prisma.salesOrder.update({
    where: { id },
    data: { status: "CONFIRMED" },
    include: { customer: true, lines: { include: { product: true } } },
  });

  return NextResponse.json(updated);
}
