"use client";

import { useState, useEffect } from "react";

interface AnalyticAccount {
  id: string;
  name: string;
  type: string;
  budgets: { id: string; name: string; plannedAmount: number }[];
}

export default function AnalyticsPage() {
  const [accounts, setAccounts] = useState<AnalyticAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("INCOME");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const res = await fetch("/api/analytics");
    const data = await res.json();
    setAccounts(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create");
        return;
      }
      setName("");
      setType("INCOME");
      setShowForm(false);
      fetchAccounts();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div>
      <div className="page-header">
        <h1>Analytic Accounts</h1>
        <div className="page-header-actions">
          {showForm ? (
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Back
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              + New
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="dash-card" style={{ marginBottom: "1.5rem" }}>
          <h3 className="dash-title">New Analytic Account</h3>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}
          <form
            onSubmit={handleCreate}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div
              className="form-group"
              style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}
            >
              <label>Analytic Account</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Marketing Department"
              />
            </div>
            <div
              className="form-group"
              style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}
            >
              <label>Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Confirm"}
            </button>
          </form>
        </div>
      )}

      <div className="data-table-wrap">
        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📊</div>
            <h3>No analytic accounts</h3>
            <p>Create your first analytic account to start budgeting</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              + New
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Type</th>
                <th>Linked Budgets</th>
                <th style={{ textAlign: "right" }}>Total Planned</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} style={{ cursor: "default" }}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {acc.name}
                  </td>
                  <td>
                    <span
                      className={`badge ${acc.type === "INCOME" ? "badge-paid" : "badge-unpaid"}`}
                    >
                      {acc.type}
                    </span>
                  </td>
                  <td>{acc.budgets.length}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    {fmt(
                      acc.budgets.reduce((sum, b) => sum + b.plannedAmount, 0),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
