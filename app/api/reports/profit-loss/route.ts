import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from =
    searchParams.get("from") ||
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];

  const fromDate = new Date(from + "T00:00:00.000Z");
  const toDate = new Date(to + "T23:59:59.999Z");

  // Get all journal entry lines within the date range
  const lines = await prisma.journalEntryLine.findMany({
    where: {
      journalEntry: {
        date: { gte: fromDate, lte: toDate },
      },
    },
    include: {
      account: true,
    },
  });

  // Aggregate by account
  const accountTotals: Record<
    string,
    { name: string; type: string; debit: number; credit: number }
  > = {};

  for (const line of lines) {
    const key = line.accountId;
    if (!accountTotals[key]) {
      accountTotals[key] = {
        name: line.account.name,
        type: line.account.type,
        debit: 0,
        credit: 0,
      };
    }
    accountTotals[key].debit += line.debit;
    accountTotals[key].credit += line.credit;
  }

  const income: { name: string; amount: number }[] = [];
  const expenses: { name: string; amount: number }[] = [];

  for (const acc of Object.values(accountTotals)) {
    if (acc.type === "INCOME") {
      income.push({ name: acc.name, amount: acc.credit - acc.debit });
    } else if (acc.type === "EXPENSE") {
      expenses.push({ name: acc.name, amount: acc.debit - acc.credit });
    }
  }

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return NextResponse.json({
    from,
    to,
    income,
    expenses,
    totalIncome,
    totalExpenses,
    netProfit,
  });
}
