// frontend/src/components/Card.jsx
import React from 'react';

export default function Card({ title, subtitle, Icon, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        background: "white",
        borderRadius: 16,
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        transition: "0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.10)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.06)";
      }}
    >
      
      {/* Icon container */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--purple), var(--blue))",
          color: "white",
          fontSize: 22,
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
        }}
      >
        <Icon />
      </div>

      {/* Text section */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
