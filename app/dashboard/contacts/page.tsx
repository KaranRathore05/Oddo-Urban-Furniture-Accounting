"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [search, typeFilter]);

  const fetchContacts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter !== "ALL") params.set("type", typeFilter);

    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    setContacts(data);
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarColors = [
    "#3b82f6",
    "#8b5cf6",
    "#0ea5e9",
    "#f59e0b",
    "#ef4444",
    "#10b981",
    "#ec4899",
  ];
  const getColor = (name: string) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

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
            style={{ maxWidth: "160px" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="BOTH">Both</option>
          </select>
          <div style={{ display: "flex", gap: "0.25rem", marginLeft: "auto" }}>
            <button
              className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setView("list")}
              title="List View"
            >
              ☰
            </button>
            <button
              className={`btn btn-sm ${view === "kanban" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setView("kanban")}
              title="Kanban View"
            >
              ▦
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <h3>No contacts found</h3>
            <p>Create your first contact to get started</p>
            <Link href="/dashboard/contacts/new" className="btn btn-primary">
              + New Contact
            </Link>
          </div>
        ) : view === "list" ? (
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
                <tr
                  key={contact.id}
                  onClick={() =>
                    router.push(`/dashboard/contacts/${contact.id}`)
                  }
                >
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {contact.name}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${contact.type.toLowerCase()}`}
                    >
                      {contact.type}
                    </span>
                  </td>
                  <td>{contact.email || "—"}</td>
                  <td>{contact.mobile || "—"}</td>
                  <td>{contact.city || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Kanban View */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1rem",
              padding: "1rem",
            }}
          >
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--accent)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: getColor(contact.name),
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <div
                      style={{ fontWeight: 600, color: "var(--text-primary)" }}
                    >
                      {contact.name}
                    </div>
                    <span
                      className={`badge badge-${contact.type.toLowerCase()}`}
                      style={{ fontSize: "0.625rem" }}
                    >
                      {contact.type}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  {contact.email && <div>✉ {contact.email}</div>}
                  {contact.mobile && <div>📱 +91 {contact.mobile}</div>}
                  {contact.city && <div>📍 {contact.city}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
