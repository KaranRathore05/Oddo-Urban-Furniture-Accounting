"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: "GOODS",
    salesPrice: "",
    cost: "",
    category: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          type: data.type || "GOODS",
          salesPrice: String(data.salesPrice || ""),
          cost: String(data.cost || ""),
          category: data.category || "",
        });
        setPageLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salesPrice: parseFloat(form.salesPrice) || 0,
          cost: parseFloat(form.cost) || 0,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) setErrors(data.details);
        return;
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch {
      setErrors({ name: ["Something went wrong"] });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <h1>Edit Product</h1>
        <div className="page-header-actions">
          <Link href="/dashboard/products" className="btn btn-secondary">
            ← Back
          </Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "640px" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            {errors.name && (
              <span className="form-error">{errors.name[0]}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Product Type *</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="GOODS">Goods</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                className="form-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sales Price (₹) *</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={form.salesPrice}
                onChange={(e) =>
                  setForm({ ...form, salesPrice: e.target.value })
                }
                required
              />
              {errors.salesPrice && (
                <span className="form-error">{errors.salesPrice[0]}</span>
              )}
            </div>
            <div className="form-group">
              <label>Cost (₹) *</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                required
              />
              {errors.cost && (
                <span className="form-error">{errors.cost[0]}</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update"}
            </button>
            <Link href="/dashboard/products" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
