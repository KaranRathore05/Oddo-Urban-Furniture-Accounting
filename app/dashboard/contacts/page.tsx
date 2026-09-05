'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  type: string;
  email: string | null;
  mobile: string | null;
  city: string | null;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [search, typeFilter]);

  const fetchContacts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter !== 'ALL') params.set('type', typeFilter);

    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    setContacts(data);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Contacts</h1>
        <div className="page-header-actions">
          <Link href="/dashboard/contacts/new" className="btn btn-primary">
            + New Contact
          </Link>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: '160px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="BOTH">Both</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page"><div className="loading-spinner" /></div>
        ) : contacts.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <h3>No contacts found</h3>
            <p>Create your first contact to get started</p>
            <Link href="/dashboard/contacts/new" className="btn btn-primary">+ New Contact</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{contact.name}</td>
                  <td>
                    <span className={`badge badge-${contact.type.toLowerCase()}`}>
                      {contact.type}
                    </span>
                  </td>
                  <td>{contact.email || '—'}</td>
                  <td>{contact.mobile || '—'}</td>
                  <td>{contact.city || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
