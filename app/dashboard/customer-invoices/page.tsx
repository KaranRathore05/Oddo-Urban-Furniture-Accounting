'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CustomerInvoice {
  id: string;
  number: string;
  customer: { name: string };
  so: { number: string };
  invoiceDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
}

export default function CustomerInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    const res = await fetch(`/api/customer-invoices?${params}`);
    const data = await res.json();
    setInvoices(data);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Customer Invoices</h1>
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
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page"><div className="loading-spinner" /></div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🧾</div>
            <h3>No customer invoices found</h3>
            <p>Invoices are generated from confirmed Sales Orders</p>
            <Link href="/dashboard/sales-orders" className="btn btn-secondary">Go to Sales Orders</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>SO Number</th>
                <th>Customer</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} onClick={() => router.push(`/dashboard/customer-invoices/${inv.id}`)}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'monospace' }}>{inv.number}</td>
                  <td style={{ fontFamily: 'monospace' }}>{inv.so.number}</td>
                  <td>{inv.customer.name}</td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{inv.amountPaid.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
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
