"use client";

import { useState, useEffect } from "react";

interface Account {
  id: string;
  name: string;
  type: string;
}
interface Journal {
  id: string;
  name: string;
  type: string;
  defaultAccount: Account;
}

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("SALES");
  const [defaultAccountId, setDefaultAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const journalTypes = ["SALES", "PURCHASE", "BANK", "CASH"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [jRes, aRes] = await Promise.all([
      fetch("/api/journals"),
      fetch("/api/accounts"),
    ]);
    const [jData, aData] = await Promise.all([jRes.json(), aRes.json()]);
    setJournals(jData);
    setAccounts(aData);
    if (aData.length > 0) setDefaultAccountId(aData[0].id);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, defaultAccountId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create journal");
        return;
      }
      setName("");
      setType("SALES");
      setShowForm(false);
      fetchData();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Journals</h1>
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
          <h3 className="dash-title">New Journal</h3>
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
              style={{ flex: 1, minWidth: "180px", marginBottom: 0 }}
            >
              <label>Journal Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Petty Cash"
              />
            </div>
            <div
              className="form-group"
              style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}
            >
              <label>Journal Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {journalTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="form-group"
              style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}
            >
              <label>Default Account</label>
              <select
                className="form-select"
                value={defaultAccountId}
                onChange={(e) => setDefaultAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
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
        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner" />
          </div>
        ) : (
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
                <tr key={journal.id} style={{ cursor: "default" }}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {journal.name}
                  </td>
                  <td>
                    <span className="badge badge-confirmed">
                      {journal.type}
                    </span>
                  </td>
                  <td>{journal.defaultAccount.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
