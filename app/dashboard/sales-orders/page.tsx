"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SOLine {
  qty: number;
  unitPrice: number;
  taxPct: number;
}

interface SalesOrder {
  id: string;
  number: string;
  customer: { name: string };
  date: string;
  status: string;
  lines: SOLine[];
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    const res = await fetch(`/api/sales-orders?${params}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  const getTotal = (lines: SOLine[]) =>
    lines.reduce(
      (sum, l) => sum + l.qty * l.unitPrice * (1 + l.taxPct / 100),
      0,
    );

  return (
    <div>
      <div className="page-header">
        <h1>Sales Orders</h1>
        <div className="page-header-actions">
          <Link href="/dashboard/sales-orders/new" className="btn btn-primary">
            + New Sales Order
          </Link>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-toolbar">
          <select
            className="form-select"
            style={{ maxWidth: "180px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="INVOICED">Invoiced</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No sales orders found</h3>
            <p>Create your first sales order to get started</p>
            <Link
              href="/dashboard/sales-orders/new"
              className="btn btn-primary"
            >
              + New Sales Order
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SO Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((so) => (
                <tr
                  key={so.id}
                  onClick={() =>
                    router.push(`/dashboard/sales-orders/${so.id}`)
                  }
                >
                  <td
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 500,
                      fontFamily: "monospace",
                    }}
                  >
                    {so.number}
                  </td>
                  <td>{so.customer.name}</td>
                  <td>{new Date(so.date).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    ₹{getTotal(so.lines).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className={`badge badge-${so.status.toLowerCase()}`}>
                      {so.status}
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
