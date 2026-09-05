'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface POLine {
  product: { name: string };
  qty: number;
  unitPrice: number;
}

interface Bill {
  id: string;
  number: string;
  status: string;
}

interface PO {
  id: string;
  number: string;
  vendor: { name: string };
  date: string;
  status: string;
  lines: POLine[];
  bill: Bill | null;
}

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [po, setPo] = useState<PO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPO();
  }, [id]);

  const fetchPO = async () => {
    setLoading(true);
    const res = await fetch(`/api/purchase-orders/${id}`);
    if (res.ok) {
      setPo(await res.json());
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    setActionLoading('confirm');
    setError('');
    try {
      const res = await fetch(`/api/purchase-orders/${id}/confirm`, { method: 'PATCH' });
      if (res.ok) {
        setSuccess('Purchase Order confirmed!');
        fetchPO();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to confirm');
      }
    } catch {
      setError('Failed to confirm');
    }
    setActionLoading('');
  };

  const handleCreateBill = async () => {
    setActionLoading('bill');
    setError('');
    try {
      const res = await fetch(`/api/purchase-orders/${id}/create-bill`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSuccess('Vendor Bill created!');
        fetchPO();
        // Navigate to the bill after a short delay
        setTimeout(() => router.push(`/dashboard/vendor-bills/${data.bill.id}`), 1000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create bill');
      }
    } catch {
      setError('Failed to create bill');
    }
    setActionLoading('');
  };

  const total = po?.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0) || 0;

  if (loading) {
    return <div className="loading-page"><div className="loading-spinner" /></div>;
  }

  if (!po) {
    return (
      <div className="empty-state">
        <h3>Purchase Order not found</h3>
        <Link href="/dashboard/purchase-orders" className="btn btn-secondary">← Back</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          {po.number}{' '}
          <span className={`badge badge-${po.status.toLowerCase()}`}>{po.status}</span>
        </h1>
        <div className="page-header-actions">
          {po.status === 'DRAFT' && (
            <button className="btn btn-primary" onClick={handleConfirm} disabled={!!actionLoading}>
              {actionLoading === 'confirm' ? 'Confirming...' : '✓ Confirm'}
            </button>
          )}
          {po.status === 'CONFIRMED' && !po.bill && (
            <button className="btn btn-primary" onClick={handleCreateBill} disabled={!!actionLoading}>
              {actionLoading === 'bill' ? 'Creating...' : '📄 Create Bill'}
            </button>
          )}
          {po.bill && (
            <Link href={`/dashboard/vendor-bills/${po.bill.id}`} className="btn btn-secondary">
              View Bill ({po.bill.number})
            </Link>
          )}
          <Link href="/dashboard/purchase-orders" className="btn btn-secondary">← Back</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}
      {success && <div className="alert alert-success">✓ {success}</div>}

      <div className="card" style={{ maxWidth: '900px' }}>
        <div className="detail-grid">
          <div className="detail-field">
            <span className="label">PO Number</span>
            <span className="value" style={{ fontFamily: 'monospace' }}>{po.number}</span>
          </div>
          <div className="detail-field">
            <span className="label">Vendor</span>
            <span className="value">{po.vendor.name}</span>
          </div>
          <div className="detail-field">
            <span className="label">Date</span>
            <span className="value">{new Date(po.date).toLocaleDateString()}</span>
          </div>
          <div className="detail-field">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge badge-${po.status.toLowerCase()}`}>{po.status}</span>
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
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((line, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)' }}>{line.product.name}</td>
                <td style={{ textAlign: 'right' }}>{line.qty}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{line.unitPrice.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  ₹{(line.qty * line.unitPrice).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right' }}>Total</td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{total.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
