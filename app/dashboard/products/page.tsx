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
        ) : (
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
        )}
      </div>
    </div>
  );
}
