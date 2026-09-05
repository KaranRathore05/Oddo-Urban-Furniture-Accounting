import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function DashboardPage() {
  const [contactCount, productCount, poCount, soCount, jeCount] = await Promise.all([
    prisma.contact.count({ where: { archived: false } }),
    prisma.product.count({ where: { archived: false } }),
    prisma.purchaseOrder.count(),
    prisma.salesOrder.count(),
    prisma.journalEntry.count(),
  ]);

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

      {/* Stats */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="stat-card">
            <div className="stat-label">Contacts</div>
            <div className="stat-value">{contactCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Products</div>
            <div className="stat-value">{productCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Purchase Orders</div>
            <div className="stat-value">{poCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sales Orders</div>
            <div className="stat-value">{soCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Journal Entries</div>
            <div className="stat-value">{jeCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
