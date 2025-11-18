import React from 'react';
import { PiggyIcon, TrendIcon, TrophyIcon } from './Icons';

const steps = [
  {
    title: 'Smart Budgeting',
    subtitle: 'Take control of your finances and plan confidently.',
    Icon: PiggyIcon
  },
  {
    title: 'Track Every Expense',
    subtitle: 'Understand your spending habits and save smarter.',
    Icon: TrendIcon
  },
  {
    title: 'Earn Rewards',
    subtitle: 'Learn financial skills and complete challenges to earn points.',
    Icon: TrophyIcon
  },
];

export default function Onboarding({ step, setStep, onFinish }) {
  const S = steps[step];

  return (
    <div
      className="onboard-wrap"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        textAlign: "center",
        background: "linear-gradient(135deg, #faf5ff, #eff6ff)"
      }}
    >
      {/* Progress Dots */}
      <div
        className="onboard-dots"
        style={{ display: "flex", gap: 8, marginBottom: 28 }}
      >
        {steps.map((_, i) => (
          <div
            key={i}
            className={`onboard-dot ${i === step ? 'active' : ''}`}
            style={{
              width: i === step ? 22 : 10,
              height: 10,
              borderRadius: 10,
              transition: "0.3s",
              background: i === step
                ? "linear-gradient(90deg, var(--purple), var(--blue))"
                : "#dbeafe"
            }}
          />
        ))}
      </div>

      {/* Main Icon */}
      <div className="onboard-hero" style={{ marginBottom: 22 }}>
        <S.Icon size={90} />
      </div>

      {/* Title */}
      <div
        className="onboard-title"
        style={{ fontSize: 26, fontWeight: 700, color: "var(--purple)", marginBottom: 10 }}
      >
        {S.title}
      </div>

      {/* Subtitle */}
      <div
        className="onboard-sub"
        style={{
          fontSize: 15,
          color: "#6b7280",
          maxWidth: 320,
          lineHeight: 1.5,
          marginBottom: 40
        }}
      >
        {S.subtitle}
      </div>

      {/* Next / Finish Button */}
      <button
        className="onboard-btn"
        onClick={() => {
          if (step < steps.length - 1) setStep(step + 1);
          else onFinish();
        }}
        style={{
          padding: "14px 28px",
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 700,
          border: "none",
          color: "white",
          background: "linear-gradient(90deg, var(--purple), var(--blue))",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(124,58,237,0.25)",
          transition: "0.25s",
        }}
      >
        {step < steps.length - 1 ? "Next ›" : "Get Started ›"}
      </button>
    </div>
  );
}
