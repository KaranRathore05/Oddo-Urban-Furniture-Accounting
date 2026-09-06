"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VendorBill {
  id: string;
  number: string;
  vendor: { name: string };
  po: { number: string };
  billDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
}

export default function VendorBillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const fetchBills = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    const res = await fetch(`/api/vendor-bills?${params}`);
    const data = await res.json();
    setBills(data);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Vendor Bills</h1>
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
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner" />
          </div>
        ) : bills.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📄</div>
            <h3>No vendor bills found</h3>
            <p>Bills are generated from confirmed Purchase Orders</p>
            <Link
              href="/dashboard/purchase-orders"
              className="btn btn-secondary"
            >
              Go to Purchase Orders
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Bill Date</th>
                <th>Due Date</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th style={{ textAlign: "right" }}>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr
                  key={bill.id}
                  onClick={() =>
                    router.push(`/dashboard/vendor-bills/${bill.id}`)
                  }
                >
                  <td
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 500,
                      fontFamily: "monospace",
                    }}
                  >
                    {bill.number}
                  </td>
                  <td style={{ fontFamily: "monospace" }}>{bill.po.number}</td>
                  <td>{bill.vendor.name}</td>
                  <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                  <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    ₹{bill.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    ₹{bill.amountPaid.toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${bill.status.toLowerCase()}`}
                    >
                      {bill.status}
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
