import Link from 'next/link';
import { prisma } from '@/lib/db';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import TopExpensesChart from '@/components/dashboard/TopExpensesChart';

export default async function DashboardPage() {
  // 1. KPIs
  const [salesAgg, purchasesAgg] = await Promise.all([
    prisma.customerInvoice.aggregate({ _sum: { totalAmount: true, amountPaid: true } }),
    prisma.vendorBill.aggregate({ _sum: { totalAmount: true, amountPaid: true } })
  ]);
  const totalSales = salesAgg._sum.totalAmount || 0;
  const totalPurchases = purchasesAgg._sum.totalAmount || 0;
  const totalReceivables = totalSales - (salesAgg._sum.amountPaid || 0);
  const totalPayables = totalPurchases - (purchasesAgg._sum.amountPaid || 0);

  // 2. Bank Balances
  const bankAccount = await prisma.account.findUnique({ where: { name: 'Bank' } });
  const bankLines = bankAccount ? await prisma.journalEntryLine.aggregate({
    where: { accountId: bankAccount.id },
    _sum: { debit: true, credit: true }
  }) : null;
  const bankBalance = (bankLines?._sum.debit || 0) - (bankLines?._sum.credit || 0);

  // 3. Top Expenses (from PurchaseOrderLines)
  const poLines = await prisma.purchaseOrderLine.findMany({ include: { product: true } });
  const expenseMap: Record<string, number> = {};
  poLines.forEach(line => {
    const name = line.product.name;
    expenseMap[name] = (expenseMap[name] || 0) + (line.qty * line.unitPrice);
  });
  const expensesData = Object.entries(expenseMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, value]) => ({ name, value }));
  if (expensesData.length === 0) {
    expensesData.push({ name: 'No Expenses', value: 1 }); // fallback
  }

  // 4. Cash Flow Data (last 5 weeks)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [inflows, outflows] = await Promise.all([
    prisma.invoicePayment.findMany({ where: { date: { gte: thirtyDaysAgo } } }),
    prisma.billPayment.findMany({ where: { date: { gte: thirtyDaysAgo } } })
  ]);

  const cashFlowMap: Record<string, { inflow: number; outflow: number }> = {};
  
  // Initialize last 5 weeks
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (i * 7));
    const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    cashFlowMap[label] = { inflow: 0, outflow: 0 };
  }
  const weekLabels = Object.keys(cashFlowMap);

  inflows.forEach(p => {
    // simple bucketing by finding closest past week label (rough approximation for demo)
    const labelIndex = Math.min(4, Math.floor((new Date().getTime() - p.date.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    if (weekLabels[4 - labelIndex]) {
      cashFlowMap[weekLabels[4 - labelIndex]].inflow += p.amount;
    }
  });
  outflows.forEach(p => {
    const labelIndex = Math.min(4, Math.floor((new Date().getTime() - p.date.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    if (weekLabels[4 - labelIndex]) {
      cashFlowMap[weekLabels[4 - labelIndex]].outflow += p.amount;
    }
  });
  const cashFlowData = weekLabels.map(name => ({ name, ...cashFlowMap[name] }));

  // 5. Recent Transactions
  const recentInvoices = await prisma.customerInvoice.findMany({ include: { customer: true }, orderBy: { invoiceDate: 'desc' }, take: 5 });
  const recentBills = await prisma.vendorBill.findMany({ include: { vendor: true }, orderBy: { billDate: 'desc' }, take: 5 });
  
  const transactions = [
    ...recentInvoices.map(i => ({ date: i.invoiceDate, type: 'Invoice', ref: i.number, party: i.customer.name, amount: i.totalAmount, status: i.status })),
    ...recentBills.map(b => ({ date: b.billDate, type: 'Bill', ref: b.number, party: b.vendor.name, amount: b.totalAmount, status: b.status }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;
  const formatDate = (d: Date) => `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          <Link href="/dashboard/purchase-orders/new" className="quick-action-card">
            <div className="icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>📦</div>
            <h3>New Purchase Order</h3>
            <p>Create a purchase order for your vendors</p>
          </Link>
          <Link href="/dashboard/sales-orders/new" className="quick-action-card">
            <div className="icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>📋</div>
            <h3>New Sales Order</h3>
            <p>Create a sales order for your customers</p>
          </Link>
          <Link href="/dashboard/contacts/new" className="quick-action-card">
            <div className="icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>👥</div>
            <h3>New Contact</h3>
            <p>Add a new customer or vendor</p>
          </Link>
          <Link href="/dashboard/products/new" className="quick-action-card">
            <div className="icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>🪑</div>
            <h3>New Product</h3>
            <p>Add a new product to your catalog</p>
          </Link>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Overview
        </h2>

        {/* 1. Top KPI Cards */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Total Sales</span>
              <div className="kpi-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' }}>📈</div>
            </div>
            <div className="kpi-value">{formatCurrency(totalSales)}</div>
            <div className="kpi-change text-success">Live Data</div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Total Purchases</span>
              <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>🛒</div>
            </div>
            <div className="kpi-value">{formatCurrency(totalPurchases)}</div>
            <div className="kpi-change text-success">Live Data</div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Total Receivables</span>
              <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>₹</div>
            </div>
            <div className="kpi-value">{formatCurrency(totalReceivables)}</div>
            <div className="kpi-change text-warning">Live Data</div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Total Payables</span>
              <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>🧾</div>
            </div>
            <div className="kpi-value">{formatCurrency(totalPayables)}</div>
            <div className="kpi-change text-danger">Live Data</div>
          </div>
        </div>

        {/* 2. Charts Row */}
        <div className="charts-row">
          <div className="dash-card">
            <h3 className="dash-title">Cash Flow Overview</h3>
            <CashFlowChart data={cashFlowData} />
          </div>
          <div className="dash-card">
            <h3 className="dash-title">Top Expenses</h3>
            <TopExpensesChart data={expensesData} />
          </div>
        </div>

        {/* 3. Bottom Row: Transactions & Banks */}
        <div className="bottom-row">
          {/* Recent Transactions Table */}
          <div className="dash-card">
            <h3 className="dash-title">Recent Transactions</h3>
            <div className="data-table-wrap" style={{ border: 'none', background: 'transparent' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Party</th>
                    <th className="text-right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(t.date)}</td>
                      <td>{t.type}</td>
                      <td className="text-info">{t.ref}</td>
                      <td>{t.party}</td>
                      <td className="text-right font-mono">{formatCurrency(t.amount)}</td>
                      <td>
                        <span className={`badge badge-${t.status.toLowerCase()}`}>
                          {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No recent transactions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bank Accounts Summary */}
          <div className="dash-card" style={{ background: 'var(--bg-secondary)', border: 'none' }}>
            <h3 className="dash-title">Bank Accounts</h3>
            
            <div className="bank-card" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <div className="bank-name">Main Bank Account</div>
              <div className="bank-ac">Auto-calculated from Journals</div>
              <div className="bank-bal">{formatCurrency(bankBalance)}</div>
            </div>
            
            <div className="bank-card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
              <div className="bank-name">Cash in Hand</div>
              <div className="bank-ac">Petty Cash</div>
              <div className="bank-bal">₹ 0</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
