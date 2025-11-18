// frontend/src/components/AchievementsView.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AchievementsView({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/achievements');
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true };
  }, []);

  if (loading) {
    return (
      <div className="section">
        <div style={{ color: "#6b7280" }}>Loading achievements…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="section">
        <div style={{ color: "red" }}>Error: {err}</div>
      </div>
    );
  }

  if (!data) return null;

  const { badges = [], points = 0, summary = {} } = data;

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
          marginBottom: 16
        }}
      >
        ←
      </button>

      <h2 style={{ marginTop: 4 }}>Achievements</h2>
      <p style={{ color: '#6b7280', marginBottom: 12 }}>
        Earn points and unlock badges as you progress!
      </p>

      {/* Points Summary */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
          marginBottom: 18
        }}
      >
        <div style={{ fontWeight: 700 }}>Total Points</div>
        <div style={{ color: 'var(--purple)', fontSize: 26, marginTop: 6 }}>
          {points} pts
        </div>

        <div style={{ color: '#9ca3af', marginTop: 8, fontSize: 13 }}>
          {summary.totalExpensesCount || 0} expenses logged •{' '}
          {summary.completedLessons || 0}/{summary.totalLessons || 0} lessons completed
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'grid', gap: 12 }}>
        {badges.map(b => (
          <div
            key={b.id}
            style={{
              display: "flex",
              background: "white",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              gap: 14,
              boxShadow: "0 6px 16px rgba(0,0,0,0.04)"
            }}
          >
            {/* Badge Icon */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                background: b.earned
                  ? "linear-gradient(90deg,var(--purple),var(--blue))"
                  : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                color: b.earned ? "white" : "#9ca3af",
                fontWeight: 700
              }}
            >
              {b.icon || "🏆"}
            </div>

            {/* Badge Content */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{b.title}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{b.description}</div>

              {/* Progress Bar */}
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 8,
                  background: '#eef2ff',
                  borderRadius: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${b.progress || 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg,var(--purple),var(--blue))'
                  }} />
                </div>
              </div>
            </div>

            {/* Right: Earned / % */}
            <div style={{ textAlign: 'right', minWidth: 50 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: b.earned ? "var(--purple)" : "#9ca3af"
                }}
              >
                {b.earned ? "Earned" : `${b.progress}%`}
              </div>
              {b.earned && (
                <div style={{ fontSize: 12, color: '#6b7280' }}>Unlocked</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
