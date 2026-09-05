import { prisma } from '@/lib/db';

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({ orderBy: { type: 'asc' } });

  return (
    <div>
      <div className="page-header">
        <h1>Chart of Accounts</h1>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} style={{ cursor: 'default' }}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{account.name}</td>
                <td>
                  <span className={`badge badge-${account.type.toLowerCase()}`}>
                    {account.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
