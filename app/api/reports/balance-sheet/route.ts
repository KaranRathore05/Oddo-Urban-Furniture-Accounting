import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asOf =
    searchParams.get("asOf") || new Date().toISOString().split("T")[0];
  const asOfDate = new Date(asOf + "T23:59:59.999Z");

  // Get all journal entry lines up to the asOf date
  const lines = await prisma.journalEntryLine.findMany({
    where: {
      journalEntry: {
        date: { lte: asOfDate },
      },
    },
    include: {
      account: true,
    },
  });

  // Aggregate balances by account
  const accountBalances: Record<
    string,
    { name: string; type: string; debit: number; credit: number }
  > = {};

  for (const line of lines) {
    const key = line.accountId;
    if (!accountBalances[key]) {
      accountBalances[key] = {
        name: line.account.name,
        type: line.account.type,
        debit: 0,
        credit: 0,
      };
    }
    accountBalances[key].debit += line.debit;
    accountBalances[key].credit += line.credit;
  }

  // Calculate net balances
  const assets: { name: string; balance: number }[] = [];
  const liabilities: { name: string; balance: number }[] = [];
  let totalIncome = 0;
  let totalExpense = 0;

  for (const acc of Object.values(accountBalances)) {
    const netBalance = acc.debit - acc.credit;

    switch (acc.type) {
      case "ASSET":
        assets.push({ name: acc.name, balance: netBalance });
        break;
      case "LIABILITY":
        // Liability has a credit-normal balance
        liabilities.push({ name: acc.name, balance: acc.credit - acc.debit });
        break;
      case "INCOME":
        totalIncome += acc.credit - acc.debit;
        break;
      case "EXPENSE":
        totalExpense += netBalance;
        break;
    }
  }

  const netProfit = totalIncome - totalExpense;
  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
  const totalLiabilitiesAndCapital = totalLiabilities + netProfit;

  return NextResponse.json({
    asOf,
    assets,
    liabilities,
    netProfit,
    totalAssets,
    totalLiabilities,
    totalLiabilitiesAndCapital,
  });
}
