"use client";

import { useState, useEffect } from "react";

interface AccountBalance {
  name: string;
  balance: number;
}

interface BalanceSheetData {
  asOf: string;
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  totalLiabilitiesAndCapital: number;
}

export default function BalanceSheetPage() {
  const [asOf, setAsOf] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [asOf]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports/balance-sheet?asOf=${asOf}`);
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  const isBalanced =
    data && Math.abs(data.totalAssets - data.totalLiabilitiesAndCapital) < 0.01;

  return (
    <div>
      <div className="page-header">
        <h1>Balance Sheet</h1>
        <div className="page-header-actions no-print">
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <label
              style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}
            >
              As of:
            </label>
            <input
              type="date"
              className="form-input"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              style={{ width: "180px" }}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            🖨 Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="loading-spinner" />
        </div>
      ) : data ? (
        <div className="report-container">
          <div className="report-header">
            <div>
              <h2>Balance Sheet</h2>
              <span
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                As of{" "}
                {new Date(data.asOf).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Urban Furniture Pvt. Ltd.
              </span>
            </div>
          </div>

          <div className="report-columns">
            {/* Assets Column */}
            <div>
              <div className="report-section">
                <div className="report-section-title">Assets</div>
                {data.assets.length === 0 ? (
                  <div className="report-row">
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      No asset entries
                    </span>
                  </div>
                ) : (
                  data.assets.map((a, i) => (
                    <div key={i} className="report-row">
                      <span>{a.name}</span>
                      <span style={{ fontFamily: "monospace" }}>
                        ₹{a.balance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                )}
                <div className="report-row total">
                  <span>Total Assets</span>
                  <span style={{ fontFamily: "monospace" }}>
                    ₹{data.totalAssets.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Liabilities + Capital Column */}
            <div>
              <div className="report-section">
                <div className="report-section-title">Liabilities</div>
                {data.liabilities.length === 0 ? (
                  <div className="report-row">
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      No liability entries
                    </span>
                  </div>
                ) : (
                  data.liabilities.map((l, i) => (
                    <div key={i} className="report-row">
                      <span>{l.name}</span>
                      <span style={{ fontFamily: "monospace" }}>
                        ₹{l.balance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                )}
                <div className="report-row total">
                  <span>Total Liabilities</span>
                  <span style={{ fontFamily: "monospace" }}>
                    ₹{data.totalLiabilities.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-title">Capital / Equity</div>
                <div className="report-row">
                  <span>Net Profit (Retained Earnings)</span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      color:
                        data.netProfit >= 0
                          ? "var(--success)"
                          : "var(--danger)",
                    }}
                  >
                    ₹{data.netProfit.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="report-row total">
                  <span>Total Liabilities + Capital</span>
                  <span style={{ fontFamily: "monospace" }}>
                    ₹{data.totalLiabilitiesAndCapital.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance check */}
          <div className={`report-row grand-total`}>
            <span>Balance Check</span>
            <span>
              {isBalanced ? (
                <span style={{ color: "var(--success)" }}>
                  ✓ Balanced — Assets (₹
                  {data.totalAssets.toLocaleString("en-IN")}) = Liabilities +
                  Capital (₹
                  {data.totalLiabilitiesAndCapital.toLocaleString("en-IN")})
                </span>
              ) : (
                <span style={{ color: "var(--danger)" }}>
                  ⚠ UNBALANCED — Assets: ₹
                  {data.totalAssets.toLocaleString("en-IN")} ≠ L+C: ₹
                  {data.totalLiabilitiesAndCapital.toLocaleString("en-IN")}
                </span>
              )}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
