// frontend/src/components/AnalyticsView.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AnalyticsView({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const a = await api.get('/analytics'); // GET /api/analytics
        if (!cancelled) setAnalytics(a);
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="section">Loading analytics…</div>;
  if (error) return <div className="section">Error: {error}</div>;
  if (!analytics) return null;

  const { totalMonthlySpending, monthLabel, spendingByCategory, categoryDistribution } = analytics;

  return (
    <div className="section" style={{ paddingBottom: 40 }}>

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: "white",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          cursor: "pointer",
          color: "var(--purple)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          marginBottom: 16,
          transition: "0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
      >
        ←
      </button>

      <h2 style={{ marginTop: 4 }}>Analytics</h2>
      <p style={{ color: "#6b7280" }}>Your spending breakdown</p>

      {/* Total Monthly Spending Card */}
      <div style={{
        marginTop: 14,
        marginBottom: 18,
        background: "white",
        padding: 18,
        borderRadius: 14,
        boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
      }}>
        <div style={{ fontWeight: 700 }}>Total Monthly Spending</div>
        <div style={{ color: "var(--purple)", fontSize: 22, marginTop: 8 }}>
          ${totalMonthlySpending.toFixed(2)}
        </div>
        <div style={{ color: "#9ca3af", marginTop: 6 }}>
          {monthLabel}
        </div>
      </div>

      {/* Bar Chart Section */}
      <div style={{
        background: "white",
        padding: 18,
        borderRadius: 14,
        marginBottom: 18,
        boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
      }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Spending by Category</div>

        <div style={{ width: "100%", height: 200 }}>
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
            {(() => {
              const cats = Object.keys(spendingByCategory);
              const values = cats.map(k => spendingByCategory[k]);
              const max = Math.max(1, ...values);
              const gap = 500 / Math.max(1, cats.length);

              return cats.map((cat, idx) => {
                const val = spendingByCategory[cat];
                const barH = (val / max) * 140; 
                const x = gap * idx + gap * 0.15;
                const y = 180 - barH;

                return (
                  <g key={cat}>
                    <rect
                      x={x}
                      y={y}
                      width={gap * 0.7}
                      height={barH}
                      rx="6"
                      fill="#a78bfa"
                    />
                    <text
                      x={x + gap * 0.35}
                      y={195}
                      fontSize="11"
                      textAnchor="middle"
                      fill="#374151"
                    >
                      {cat}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div style={{
        background: "white",
        padding: 18,
        borderRadius: 14,
        boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
      }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Category Distribution</div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          
          {/* PIE GRAPH */}
          <div style={{ width: 160, height: 160 }}>
            <svg viewBox="0 0 32 32" width="160" height="160">
              {(() => {
                const total = categoryDistribution.reduce((s, it) => s + it.amount, 0) || 1;
                let start = 0;
                const colors = ["#8b5cf6", "#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#93c5fd"];

                return categoryDistribution.map((c, i) => {
                  const slice = c.amount / total;
                  const end = start + slice;
                  const large = slice > 0.5 ? 1 : 0;

                  const sx = 16 + 10 * Math.cos(2 * Math.PI * start);
                  const sy = 16 + 10 * Math.sin(2 * Math.PI * start);
                  const ex = 16 + 10 * Math.cos(2 * Math.PI * end);
                  const ey = 16 + 10 * Math.sin(2 * Math.PI * end);

                  const d = `M16 16 L ${sx} ${sy} A 10 10 0 ${large} 1 ${ex} ${ey} Z`;

                  start = end;

                  return (
                    <path
                      key={c.category}
                      d={d}
                      fill={colors[i % colors.length]}
                      stroke="#fff"
                      strokeWidth="0.3"
                    />
                  );
                });
              })()}
            </svg>
          </div>

          {/* PIE LEGEND */}
          <div style={{ flex: 1 }}>
            {categoryDistribution.map((c, i) => (
              <div
                key={c.category}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0"
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: ["#8b5cf6", "#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#93c5fd"][i % 6],
                      borderRadius: 3
                    }}
                  />
                  <div>{c.category}</div>
                </div>
                <div style={{ color: "#6b7280" }}>
                  {((c.amount / (categoryDistribution.reduce((s, it) => s + it.amount, 0) || 1)) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
