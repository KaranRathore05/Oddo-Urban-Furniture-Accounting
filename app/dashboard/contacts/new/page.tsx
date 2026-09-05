'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', type: 'CUSTOMER', email: '', mobile: '', city: '', state: '', pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) setErrors(data.details);
        return;
      }

      router.push('/dashboard/contacts');
      router.refresh();
    } catch {
      setErrors({ name: ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>New Contact</h1>
        <div className="page-header-actions">
          <Link href="/dashboard/contacts" className="btn btn-secondary">← Back</Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Contact Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            {errors.name && <span className="form-error">{errors.name[0]}</span>}
          </div>

          <div className="form-group">
            <label>Type *</label>
            <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="BOTH">Both</option>
            </select>
            {errors.type && <span className="form-error">{errors.type[0]}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <span className="form-error">{errors.email[0]}</span>}
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input className="form-input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit number" />
              {errors.mobile && <span className="form-error">{errors.mobile[0]}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input className="form-input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input className="form-input" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} style={{ maxWidth: '200px' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Confirm'}
            </button>
            <Link href="/dashboard/contacts" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
