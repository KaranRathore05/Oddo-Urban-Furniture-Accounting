import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const budgets = await prisma.budget.findMany({
    include: { analyticAccount: true },
    orderBy: { periodStart: "desc" },
  });
  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  try {
    const {
      name,
      periodStart,
      periodEnd,
      responsiblePerson,
      analyticAccountId,
      plannedAmount,
    } = await request.json();

    if (
      !name ||
      !periodStart ||
      !periodEnd ||
      !responsiblePerson ||
      !analyticAccountId ||
      !plannedAmount
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        responsiblePerson,
        analyticAccountId,
        plannedAmount: Number(plannedAmount),
      },
      include: { analyticAccount: true },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Create budget error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
