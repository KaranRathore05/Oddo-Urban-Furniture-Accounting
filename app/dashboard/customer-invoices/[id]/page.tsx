"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Payment {
  id: string;
  method: string;
  amount: number;
  date: string;
  journalEntryId: string;
}

interface SOLine {
  product: { name: string };
  qty: number;
  unitPrice: number;
  taxPct: number;
}

interface InvoiceDetail {
  id: string;
  number: string;
  customer: { name: string };
  so: { number: string; lines: SOLine[] };
  invoiceDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  payments: Payment[];
}

export default function CustomerInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payMethod, setPayMethod] = useState("CASH");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    const res = await fetch(`/api/customer-invoices/${id}`);
    if (res.ok) {
      const data = await res.json();
      setInvoice(data);
      setPayAmount(String(data.totalAmount - data.amountPaid));
    }
    setLoading(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/customer-invoices/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: payMethod,
          amount: Number(payAmount),
          date: payDate,
        }),
      });

      if (res.ok) {
        setSuccess("Payment recorded successfully!");
        setShowPaymentModal(false);
        fetchInvoice();
      } else {
        const data = await res.json();
        setError(data.error || "Payment failed");
      }
    } catch {
      setError("Payment failed");
    }
    setPayLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="empty-state">
        <h3>Customer Invoice not found</h3>
        <Link href="/dashboard/customer-invoices" className="btn btn-secondary">
          ← Back
        </Link>
      </div>
    );
  }

  const outstanding = invoice.totalAmount - invoice.amountPaid;
  const getLineSubtotal = (l: SOLine) =>
    l.qty * l.unitPrice * (1 + l.taxPct / 100);

  return (
    <div>
      <div className="page-header">
        <h1>
          {invoice.number}{" "}
          <span className={`badge badge-${invoice.status.toLowerCase()}`}>
            {invoice.status}
          </span>
        </h1>
        <div className="page-header-actions">
          {invoice.status !== "PAID" && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowPaymentModal(true);
                setError("");
                setSuccess("");
              }}
            >
              💳 New Payment
            </button>
          )}
          <Link
            href="/dashboard/customer-invoices"
            className="btn btn-secondary"
          >
            ← Back
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}
      {success && <div className="alert alert-success">✓ {success}</div>}

      <div className="card" style={{ maxWidth: "960px" }}>
        <div className="detail-grid">
          <div className="detail-field">
            <span className="label">Invoice Number</span>
            <span className="value" style={{ fontFamily: "monospace" }}>
              {invoice.number}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">SO Number</span>
            <span className="value" style={{ fontFamily: "monospace" }}>
              {invoice.so.number}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">Customer</span>
            <span className="value">{invoice.customer.name}</span>
          </div>
          <div className="detail-field">
            <span className="label">Invoice Date</span>
            <span className="value">
              {new Date(invoice.invoiceDate).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">Due Date</span>
            <span className="value">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge badge-${invoice.status.toLowerCase()}`}>
                {invoice.status}
              </span>
            </span>
          </div>
        </div>

        <div className="detail-grid" style={{ marginTop: "1rem" }}>
          <div className="detail-field">
            <span className="label">Total Amount</span>
            <span
              className="value"
              style={{
                fontFamily: "monospace",
                fontSize: "1.25rem",
                color: "var(--accent)",
              }}
            >
              ₹{invoice.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">Amount Paid</span>
            <span
              className="value"
              style={{
                fontFamily: "monospace",
                fontSize: "1.25rem",
                color: "var(--success)",
              }}
            >
              ₹{invoice.amountPaid.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="detail-field">
            <span className="label">Outstanding</span>
            <span
              className="value"
              style={{
                fontFamily: "monospace",
                fontSize: "1.25rem",
                color: outstanding > 0 ? "var(--warning)" : "var(--success)",
              }}
            >
              ₹{outstanding.toLocaleString("en-IN")}
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
          Line Items (from SO)
        </h3>
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: "right" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>Tax %</th>
              <th style={{ textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.so.lines.map((line, i) => (
              <tr key={i}>
                <td style={{ color: "var(--text-primary)" }}>
                  {line.product.name}
                </td>
                <td style={{ textAlign: "right" }}>{line.qty}</td>
                <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                  ₹{line.unitPrice.toLocaleString("en-IN")}
                </td>
                <td style={{ textAlign: "right" }}>{line.taxPct}%</td>
                <td
                  style={{
                    textAlign: "right",
                    fontFamily: "monospace",
                    color: "var(--text-primary)",
                  }}
                >
                  ₹{getLineSubtotal(line).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: "right" }}>
                Total
              </td>
              <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                ₹{invoice.totalAmount.toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>

        {invoice.payments.length > 0 && (
          <>
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
              Payment History
            </h3>
            <table className="line-items-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Journal Entry</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge badge-${p.method.toLowerCase() === "bank" ? "confirmed" : "posted"}`}
                      >
                        {p.method}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: "var(--success)",
                      }}
                    >
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/journal-entries/${p.journalEntryId}`}
                        style={{
                          color: "var(--accent)",
                          textDecoration: "underline",
                        }}
                      >
                        View Entry
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Record Payment</h2>
            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  className="form-select"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  Amount * (Outstanding: ₹{outstanding.toLocaleString("en-IN")})
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  min="0.01"
                  max={outstanding}
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                />
              </div>
              <div
                style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={payLoading}
                >
                  {payLoading ? "Processing..." : "Confirm Payment"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
