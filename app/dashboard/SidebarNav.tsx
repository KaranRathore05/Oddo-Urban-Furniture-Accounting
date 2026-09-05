'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarNavProps {
  user: { id: string; fullName: string; email: string; role: string };
}

const navSections = [
  {
    title: 'Sales',
    items: [
      { label: 'Sales Orders', href: '/dashboard/sales-orders', icon: '📋' },
      { label: 'Customer Invoices', href: '/dashboard/customer-invoices', icon: '🧾' },
    ],
  },
  {
    title: 'Purchase',
    items: [
      { label: 'Purchase Orders', href: '/dashboard/purchase-orders', icon: '📦' },
      { label: 'Vendor Bills', href: '/dashboard/vendor-bills', icon: '📄' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Contacts', href: '/dashboard/contacts', icon: '👥' },
      { label: 'Products', href: '/dashboard/products', icon: '🪑' },
      { label: 'Chart of Accounts', href: '/dashboard/accounts', icon: '📊' },
      { label: 'Journals', href: '/dashboard/journals', icon: '📒' },
      { label: 'Journal Entries', href: '/dashboard/journal-entries', icon: '📝' },
    ],
  },
  {
    title: 'Report',
    items: [
      { label: 'Balance Sheet', href: '/dashboard/reports/balance-sheet', icon: '📈' },
      { label: 'Profit & Loss', href: '/dashboard/reports/profit-loss', icon: '💰' },
    ],
  },
];

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <h2>Urban Furniture</h2>
          <span>Accounting System</span>
        </Link>
      </div>

      <nav>
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Signed in as<br />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{user.email}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm btn-full">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
