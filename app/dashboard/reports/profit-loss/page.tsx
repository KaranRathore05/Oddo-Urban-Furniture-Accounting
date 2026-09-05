'use client';

import { useState, useEffect } from 'react';

interface AccountAmount {
  name: string;
  amount: number;
}

interface PLData {
  from: string;
  to: string;
  income: AccountAmount[];
  expenses: AccountAmount[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export default function ProfitLossPage() {
  const currentYear = new Date().getFullYear();
  const [from, setFrom] = useState(`${currentYear}-01-01`);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<PLData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [from, to]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports/profit-loss?from=${from}&to=${to}`);
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Profit & Loss</h1>
        <div className="page-header-actions no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>From:</label>
            <input
              type="date"
              className="form-input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ width: '170px' }}
            />
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>To:</label>
            <input
              type="date"
              className="form-input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ width: '170px' }}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            🖨 Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-page"><div className="loading-spinner" /></div>
      ) : data ? (
        <div className="report-container" style={{ maxWidth: '700px' }}>
          <div className="report-header">
            <div>
              <h2>Profit & Loss Statement</h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {new Date(data.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' — '}
                {new Date(data.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urban Furniture Pvt. Ltd.</span>
            </div>
          </div>

          {/* Income Section */}
          <div className="report-section">
            <div className="report-section-title">Income</div>
            {data.income.length === 0 ? (
              <div className="report-row">
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No income entries</span>
              </div>
            ) : (
              data.income.map((item, i) => (
                <div key={i} className="report-row">
                  <span>{item.name}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--success)' }}>₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
            <div className="report-row total">
              <span>Total Income</span>
              <span style={{ fontFamily: 'monospace' }}>₹{data.totalIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="report-section">
            <div className="report-section-title">Expenses</div>
            {data.expenses.length === 0 ? (
              <div className="report-row">
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No expense entries</span>
              </div>
            ) : (
              data.expenses.map((item, i) => (
                <div key={i} className="report-row">
                  <span>{item.name}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--danger)' }}>₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
            <div className="report-row total">
              <span>Total Expenses</span>
              <span style={{ fontFamily: 'monospace' }}>₹{data.totalExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="report-row grand-total">
            <span>Net Profit</span>
            <span style={{ fontFamily: 'monospace', color: data.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              ₹{data.netProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
