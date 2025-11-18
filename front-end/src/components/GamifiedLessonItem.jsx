// frontend/src/components/GamifiedLessonItem.jsx
import React from "react";
import { LockIcon, TrophyIcon, PlayIcon } from "./Icons";

export default function GamifiedLessonItem({ lesson, onStart }) {
  const { title, level, time, progress = 0, xp = 0, locked = false } = lesson;
  const gradient = "linear-gradient(90deg, var(--purple), var(--blue))";

  function handleClick() {
    if (locked) return;
    if (onStart) onStart(lesson);   // Safe call
  }

  return (
    <div
      style={{
        background: "white",
        padding: 16,
        borderRadius: 18,
        boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>
            {level} • {time}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {locked && (
            <div style={{ opacity: 0.6 }}>
              <LockIcon />
            </div>
          )}

          {!locked && progress === 100 && (
            <div style={{ color: "var(--purple)" }}>
              <TrophyIcon />
            </div>
          )}

          {!locked && progress < 100 && (
            <div
              style={{
                fontSize: 12,
                padding: "4px 8px",
                borderRadius: 12,
                background: "#f1f5f9",
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              {xp} XP
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: 8,
          background: "#f3f4f6",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: gradient,
            transition: "0.3s ease",
          }}
        />
      </div>

      {/* Bottom Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--purple)" }}>
          {locked
            ? "Locked"
            : progress === 100
            ? "Completed"
            : `${progress}% complete`}
        </div>

        <button
          onClick={handleClick}
          disabled={locked}
          style={{
            padding: "6px 14px",
            borderRadius: 12,
            border: "none",
            background: locked
              ? "#e5e7eb"
              : "linear-gradient(90deg,var(--purple),var(--blue))",
            color: locked ? "#9ca3af" : "white",
            cursor: locked ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {locked
            ? "Locked"
            : progress === 0
            ? "Start"
            : progress === 100
            ? "Review"
            : "Continue"}

          {!locked && <PlayIcon />}
        </button>
      </div>
    </div>
  );
}
