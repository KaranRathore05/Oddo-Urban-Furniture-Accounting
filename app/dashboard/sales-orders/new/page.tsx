"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  salesPrice: number;
}

interface LineItem {
  productId: string;
  qty: number;
  unitPrice: number;
  taxPct: number;
}

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<LineItem[]>([
    { productId: "", qty: 1, unitPrice: 0, taxPct: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/contacts?type=CUSTOMER")
      .then((r) => r.json())
      .then((data) => {
        fetch("/api/contacts?type=BOTH")
          .then((r) => r.json())
          .then((both) => setCustomers([...data, ...both]));
      });
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const updateLine = (
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    const updated = [...lines];
    if (field === "productId") {
      updated[index].productId = value as string;
      const product = products.find((p) => p.id === value);
      if (product) updated[index].unitPrice = product.salesPrice;
    } else if (field === "qty") {
      updated[index].qty = Number(value) || 0;
    } else if (field === "unitPrice") {
      updated[index].unitPrice = Number(value) || 0;
    } else if (field === "taxPct") {
      updated[index].taxPct = Number(value) || 0;
    }
    setLines(updated);
  };

  const addLine = () =>
    setLines([...lines, { productId: "", qty: 1, unitPrice: 0, taxPct: 0 }]);
  const removeLine = (i: number) => {
    if (lines.length > 1) setLines(lines.filter((_, idx) => idx !== i));
  };

  const getLineSubtotal = (l: LineItem) =>
    l.qty * l.unitPrice * (1 + l.taxPct / 100);
  const total = lines.reduce((sum, l) => sum + getLineSubtotal(l), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, date, lines }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) setErrors(data.details);
        return;
      }

      router.push(`/dashboard/sales-orders/${data.id}`);
      router.refresh();
    } catch {
      setErrors({ customerId: ["Something went wrong"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>New Sales Order</h1>
        <div className="page-header-actions">
          <Link href="/dashboard/sales-orders" className="btn btn-secondary">
            ← Back
          </Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "960px" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Customer *</label>
              <select
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <span className="form-error">{errors.customerId[0]}</span>
              )}
            </div>
            <div className="form-group">
              <label>SO Date *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {errors.date && (
                <span className="form-error">{errors.date[0]}</span>
              )}
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <label
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
                display: "block",
              }}
            >
              Line Items
            </label>
            {errors.lines && (
              <span
                className="form-error"
                style={{ marginBottom: "0.5rem", display: "block" }}
              >
                {errors.lines[0]}
              </span>
            )}
            <table className="line-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ width: "80px" }}>Qty</th>
                  <th style={{ width: "130px" }}>Unit Price</th>
                  <th style={{ width: "80px" }}>Tax %</th>
                  <th style={{ width: "140px", textAlign: "right" }}>
                    Subtotal
                  </th>
                  <th style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td>
                      <select
                        className="form-select"
                        value={line.productId}
                        onChange={(e) =>
                          updateLine(i, "productId", e.target.value)
                        }
                        required
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={line.qty}
                        onChange={(e) => updateLine(i, "qty", e.target.value)}
                        min="1"
                        step="1"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLine(i, "unitPrice", e.target.value)
                        }
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={line.taxPct}
                        onChange={(e) =>
                          updateLine(i, "taxPct", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: "var(--text-primary)",
                      }}
                    >
                      ₹{getLineSubtotal(line).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        ×
                      </button>
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
                    ₹{total.toLocaleString("en-IN")}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            <button
              type="button"
              onClick={addLine}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "0.5rem" }}
            >
              + Add Line
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Sales Order"}
            </button>
            <Link href="/dashboard/sales-orders" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
