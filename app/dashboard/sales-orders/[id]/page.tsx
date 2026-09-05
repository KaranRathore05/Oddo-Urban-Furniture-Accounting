'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SOLine {
  product: { name: string };
  qty: number;
  unitPrice: number;
  taxPct: number;
}

interface Invoice {
  id: string;
  number: string;
  status: string;
}

interface SO {
  id: string;
  number: string;
  customer: { name: string };
  date: string;
  status: string;
  lines: SOLine[];
  invoice: Invoice | null;
}

export default function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [so, setSo] = useState<SO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSO();
  }, [id]);

  const fetchSO = async () => {
    setLoading(true);
    const res = await fetch(`/api/sales-orders/${id}`);
    if (res.ok) {
      setSo(await res.json());
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    setActionLoading('confirm');
    setError('');
    try {
      const res = await fetch(`/api/sales-orders/${id}/confirm`, { method: 'PATCH' });
      if (res.ok) {
        setSuccess('Sales Order confirmed!');
        fetchSO();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to confirm');
      }
    } catch {
      setError('Failed to confirm');
    }
    setActionLoading('');
  };

  const handleCreateInvoice = async () => {
    setActionLoading('invoice');
    setError('');
    try {
      const res = await fetch(`/api/sales-orders/${id}/create-invoice`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSuccess('Customer Invoice created!');
        fetchSO();
        setTimeout(() => router.push(`/dashboard/customer-invoices/${data.invoice.id}`), 1000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create invoice');
      }
    } catch {
      setError('Failed to create invoice');
    }
    setActionLoading('');
  };

  const getLineSubtotal = (l: SOLine) => l.qty * l.unitPrice * (1 + l.taxPct / 100);
  const total = so?.lines.reduce((sum, l) => sum + getLineSubtotal(l), 0) || 0;

  if (loading) {
    return <div className="loading-page"><div className="loading-spinner" /></div>;
  }

  if (!so) {
    return (
      <div className="empty-state">
        <h3>Sales Order not found</h3>
        <Link href="/dashboard/sales-orders" className="btn btn-secondary">← Back</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          {so.number}{' '}
          <span className={`badge badge-${so.status.toLowerCase()}`}>{so.status}</span>
        </h1>
        <div className="page-header-actions">
          {so.status === 'DRAFT' && (
            <button className="btn btn-primary" onClick={handleConfirm} disabled={!!actionLoading}>
              {actionLoading === 'confirm' ? 'Confirming...' : '✓ Confirm'}
            </button>
          )}
          {so.status === 'CONFIRMED' && !so.invoice && (
            <button className="btn btn-primary" onClick={handleCreateInvoice} disabled={!!actionLoading}>
              {actionLoading === 'invoice' ? 'Creating...' : '🧾 Create Invoice'}
            </button>
          )}
          {so.invoice && (
            <Link href={`/dashboard/customer-invoices/${so.invoice.id}`} className="btn btn-secondary">
              View Invoice ({so.invoice.number})
            </Link>
          )}
          <Link href="/dashboard/sales-orders" className="btn btn-secondary">← Back</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}
      {success && <div className="alert alert-success">✓ {success}</div>}

      <div className="card" style={{ maxWidth: '960px' }}>
        <div className="detail-grid">
          <div className="detail-field">
            <span className="label">SO Number</span>
            <span className="value" style={{ fontFamily: 'monospace' }}>{so.number}</span>
          </div>
          <div className="detail-field">
            <span className="label">Customer</span>
            <span className="value">{so.customer.name}</span>
          </div>
          <div className="detail-field">
            <span className="label">Date</span>
            <span className="value">{new Date(so.date).toLocaleDateString()}</span>
          </div>
          <div className="detail-field">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge badge-${so.status.toLowerCase()}`}>{so.status}</span>
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.5rem 0 0.75rem' }}>
          Line Items
        </h3>
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Tax %</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {so.lines.map((line, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)' }}>{line.product.name}</td>
                <td style={{ textAlign: 'right' }}>{line.qty}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{line.unitPrice.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right' }}>{line.taxPct}%</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  ₹{getLineSubtotal(line).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: 'right' }}>Total</td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{total.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
