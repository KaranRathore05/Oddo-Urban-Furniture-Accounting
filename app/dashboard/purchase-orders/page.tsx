'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface POLine {
  qty: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  number: string;
  vendor: { name: string };
  date: string;
  status: string;
  lines: POLine[];
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    const res = await fetch(`/api/purchase-orders?${params}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  const getTotal = (lines: POLine[]) =>
    lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Purchase Orders</h1>
        <div className="page-header-actions">
          <Link href="/dashboard/purchase-orders/new" className="btn btn-primary">
            + New Purchase Order
          </Link>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <select
            className="form-select"
            style={{ maxWidth: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="BILLED">Billed</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page"><div className="loading-spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>No purchase orders found</h3>
            <p>Create your first purchase order to get started</p>
            <Link href="/dashboard/purchase-orders/new" className="btn btn-primary">+ New Purchase Order</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.id} onClick={() => router.push(`/dashboard/purchase-orders/${po.id}`)}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'monospace' }}>{po.number}</td>
                  <td>{po.vendor.name}</td>
                  <td>{new Date(po.date).toLocaleDateString()}</td>
                  <td style={{ fontFamily: 'monospace' }}>₹{getTotal(po.lines).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge badge-${po.status.toLowerCase()}`}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
