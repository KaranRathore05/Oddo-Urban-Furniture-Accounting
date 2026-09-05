import { prisma } from '@/lib/db';

export default async function JournalsPage() {
  const journals = await prisma.journal.findMany({
    include: { defaultAccount: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <div className="page-header">
        <h1>Journals</h1>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Journal Name</th>
              <th>Type</th>
              <th>Default Account</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((journal) => (
              <tr key={journal.id} style={{ cursor: 'default' }}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{journal.name}</td>
                <td><span className="badge badge-confirmed">{journal.type}</span></td>
                <td>{journal.defaultAccount.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
