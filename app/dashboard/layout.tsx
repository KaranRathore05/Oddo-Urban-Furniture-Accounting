import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SidebarNav } from './SidebarNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="dashboard-layout">
      <SidebarNav user={session} />
      <div className="main-content">
        <div className="topbar">
          <div />
          <div className="topbar-user">
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {session.fullName}
            </span>
            <div className="topbar-avatar">
              {session.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
