'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  cost: number;
  category: string | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const categoryColors: Record<string, string> = {
    'Seating': '#3b82f6',
    'Tables': '#8b5cf6',
    'Desks': '#0ea5e9',
    'Storage': '#f59e0b',
    'Furniture': '#10b981',
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <div className="page-header-actions">
          <Link href="/dashboard/products/new" className="btn btn-primary">+ New Product</Link>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
            <button
              className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('list')}
              title="List View"
            >☰</button>
            <button
              className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('kanban')}
              title="Kanban View"
            >▦</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="loading-spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🪑</div>
            <h3>No products found</h3>
            <p>Add your first product to get started</p>
            <Link href="/dashboard/products/new" className="btn btn-primary">+ New Product</Link>
          </div>
        ) : view === 'list' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Sales Price</th>
                <th style={{ textAlign: 'right' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</td>
                  <td>{product.category || '—'}</td>
                  <td><span className="badge badge-confirmed">{product.type}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fmt(product.salesPrice)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fmt(product.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Kanban View */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', padding: '1rem' }}>
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/dashboard/products/${product.id}`)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: '100%', height: '6px', borderRadius: '3px',
                  background: categoryColors[product.category || 'Furniture'] || '#6b7280',
                  marginBottom: '1rem'
                }} />
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  {product.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {product.category || 'Uncategorized'} · {product.type}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', textTransform: 'uppercase' }}>Sales Price</div>
                    <div style={{ fontWeight: 600, color: 'var(--success)', fontFamily: 'monospace' }}>{fmt(product.salesPrice)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', textTransform: 'uppercase' }}>Cost</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{fmt(product.cost)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
