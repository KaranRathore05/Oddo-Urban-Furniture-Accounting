"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Account {
  id: string;
  name: string;
  type: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("ASSET");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const accountTypes = [
    "ASSET",
    "LIABILITY",
    "BANK",
    "CAPITAL",
    "CASH",
    "INCOME",
    "EXPENSE",
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const res = await fetch("/api/accounts");
    const data = await res.json();
    setAccounts(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create account");
        return;
      }
      setName("");
      setType("ASSET");
      setShowForm(false);
      fetchAccounts();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Chart of Accounts</h1>
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
          <h3 className="dash-title">New Account</h3>
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
              <label>Account Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Tax A/c"
              />
            </div>
            <div
              className="form-group"
              style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}
            >
              <label>Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {accountTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </button>
          </form>
        </div>
      )}

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-sm btn-secondary">New</button>
            <button className="btn btn-sm btn-secondary">Confirm</button>
            <button className="btn btn-sm btn-secondary">Archived</button>
            <button className="btn btn-sm btn-secondary">View</button>
            <button className="btn btn-sm btn-secondary">Back</button>
          </div>
        </div>
        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} style={{ cursor: "default" }}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {account.name}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${account.type.toLowerCase()}`}
                    >
                      {account.type}
                    </span>
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
