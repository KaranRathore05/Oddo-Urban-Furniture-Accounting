'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const BudgetPieChart = dynamic(() => import('@/components/dashboard/BudgetPieChart'), { ssr: false });

interface AnalyticAccount { id: string; name: string; type: string; }
interface Budget {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  responsiblePerson: string;
  plannedAmount: number;
  analyticAccount: AnalyticAccount;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    periodStart: '',
    periodEnd: '',
    responsiblePerson: '',
    analyticAccountId: '',
    plannedAmount: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [bRes, aRes] = await Promise.all([fetch('/api/budgets'), fetch('/api/analytics')]);
    const [bData, aData] = await Promise.all([bRes.json(), aRes.json()]);
    setBudgets(bData);
    setAnalytics(aData);
    if (aData.length > 0 && !form.analyticAccountId) {
      setForm(f => ({ ...f, analyticAccountId: aData[0].id }));
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create budget');
        return;
      }
      setForm({ name: '', periodStart: '', periodEnd: '', responsiblePerson: '', analyticAccountId: analytics[0]?.id || '', plannedAmount: '' });
      setShowForm(false);
      fetchData();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const pieData = budgets.map(b => ({ name: b.name, value: b.plannedAmount }));

  return (
    <div>
      <div className="page-header">
        <h1>Budgets</h1>
        <div className="page-header-actions">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')}>List</button>
            <button className={`btn btn-sm ${viewMode === 'chart' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('chart')}>Chart</button>
          </div>
          {showForm ? (
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Back</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New</button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="dash-title">New Budget</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Budget Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Q3 Marketing" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Period Start</label>
                <input className="form-input" type="date" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Period End</label>
                <input className="form-input" type="date" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Responsible Person</label>
                <input className="form-input" value={form.responsiblePerson} onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })} required placeholder="e.g. Karan" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Analytic Account</label>
                <select className="form-select" value={form.analyticAccountId} onChange={(e) => setForm({ ...form, analyticAccountId: e.target.value })}>
                  {analytics.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Planned Amount (₹)</label>
                <input className="form-input" type="number" value={form.plannedAmount} onChange={(e) => setForm({ ...form, plannedAmount: e.target.value })} required placeholder="100000" />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-page"><div className="loading-spinner" /></div>
      ) : viewMode === 'list' ? (
        <div className="data-table-wrap">
          {budgets.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💰</div>
              <h3>No budgets yet</h3>
              <p>Create your first budget to track spending</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Budget Name</th>
                  <th>Analytic Account</th>
                  <th>Period</th>
                  <th>Responsible</th>
                  <th style={{ textAlign: 'right' }}>Planned Amount</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => (
                  <tr key={b.id} style={{ cursor: 'default' }}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.name}</td>
                    <td>{b.analyticAccount.name}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{fmtDate(b.periodStart)} – {fmtDate(b.periodEnd)}</td>
                    <td>{b.responsiblePerson}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(b.plannedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Chart View */
        <div className="charts-row">
          <div className="dash-card">
            <h3 className="dash-title">Budget Allocation</h3>
            {pieData.length > 0 ? (
              <BudgetPieChart data={pieData} />
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No budgets to visualize</p>
            )}
          </div>
          <div className="dash-card">
            <h3 className="dash-title">Budget Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {budgets.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmtDate(b.periodStart)} – {fmtDate(b.periodEnd)}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', alignSelf: 'center' }}>{fmt(b.plannedAmount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
