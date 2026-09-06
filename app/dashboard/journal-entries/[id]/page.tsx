"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface JELine {
  id: string;
  account: { name: string; type: string };
  debit: number;
  credit: number;
}

interface JEDetail {
  id: string;
  reference: string;
  date: string;
  journal: { name: string; type: string };
  partner: { name: string } | null;
  status: string;
  sourceType: string;
  sourceId: string;
  lines: JELine[];
  createdAt: string;
}

export default function JournalEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<JEDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    setLoading(true);
    const res = await fetch(`/api/journal-entries/${id}`);
    if (res.ok) {
      setEntry(await res.json());
    }
    setLoading(false);
  };

  const formatSourceType = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="empty-state">
        <h3>Journal Entry not found</h3>
        <Link href="/dashboard/journal-entries" className="btn btn-secondary">
          ← Back
        </Link>
      </div>
    );
  }

  const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);

  return (
    <div>
      <div className="page-header">
        <h1>
          Journal Entry — {entry.reference}{" "}
          <span className="badge badge-posted">{entry.status}</span>
        </h1>
        <div className="page-header-actions">
          <Link href="/dashboard/journal-entries" className="btn btn-secondary">
            ← Back
          </Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "900px" }}>
        <div className="detail-grid">
          <div className="detail-field">
            <span className="label">Reference</span>
            <span className="value" style={{ fontFamily: "monospace" }}>
              {entry.reference}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">Journal</span>
            <span className="value">{entry.journal.name}</span>
          </div>
          <div className="detail-field">
            <span className="label">Date</span>
            <span className="value">
              {new Date(entry.date).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">Partner</span>
            <span className="value">{entry.partner?.name || "—"}</span>
          </div>
          <div className="detail-field">
            <span className="label">Source Type</span>
            <span className="value">{formatSourceType(entry.sourceType)}</span>
          </div>
          <div className="detail-field">
            <span className="label">Status</span>
            <span className="value">
              <span className="badge badge-posted">{entry.status}</span>
            </span>
          </div>
        </div>

        <h3
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: "2rem 0 0.75rem",
          }}
        >
          Entry Lines
        </h3>
        <div className="je-preview">
          <table className="line-items-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Account</th>
                <th>Account Type</th>
                <th style={{ textAlign: "right" }}>Debit</th>
                <th style={{ textAlign: "right" }}>Credit</th>
              </tr>
            </thead>
            <tbody>
              {entry.lines.map((line) => (
                <tr key={line.id}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {line.account.name}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${line.account.type.toLowerCase()}`}
                    >
                      {line.account.type}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontFamily: "monospace",
                      color:
                        line.debit > 0 ? "var(--success)" : "var(--text-muted)",
                    }}
                  >
                    {line.debit > 0
                      ? `₹${line.debit.toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontFamily: "monospace",
                      color:
                        line.credit > 0 ? "var(--danger)" : "var(--text-muted)",
                    }}
                  >
                    {line.credit > 0
                      ? `₹${line.credit.toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ textAlign: "right", fontWeight: 700 }}>
                  Totals
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                >
                  ₹{totalDebit.toLocaleString("en-IN")}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                >
                  ₹{totalCredit.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {Math.abs(totalDebit - totalCredit) < 0.01 ? (
          <div className="alert alert-success" style={{ marginTop: "1rem" }}>
            ✓ This entry is balanced (Debit = Credit = ₹
            {totalDebit.toLocaleString("en-IN")})
          </div>
        ) : (
          <div className="alert alert-error" style={{ marginTop: "1rem" }}>
            ⚠ This entry is UNBALANCED — Debit: ₹
            {totalDebit.toLocaleString("en-IN")}, Credit: ₹
            {totalCredit.toLocaleString("en-IN")}
          </div>
        )}
      </div>
    </div>
  );
}
