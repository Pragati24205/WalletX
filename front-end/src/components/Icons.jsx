import React from 'react';

/* -----------------------------
    GENERAL APP ICONS
------------------------------ */

export const PiggyIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 10c0 0 1-5 6-5s6 3 6 5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v3a2 2 0 0 1-2 2h-1" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="11.5" cy="11.5" r=".5" fill="#60a5fa"/>
  </svg>
);

export const TrendIcon = ({ size = 48 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M3 16l4-4 4 4 6-6 4 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TrophyIcon = ({ size = 48 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path d="M8 3h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3z" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 8v2a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5V8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WalletIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="12" rx="2" fill="#ffffff"/>
    <circle cx="17" cy="12" r="1" fill="#ffffff"/>
  </svg>
);

export const BarIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M3 12h3v7H3zM9 8h3v11H9zM15 4h3v15h-3z" fill="#3b82f6"/>
  </svg>
);

export const BookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M3 6h13v12H3z" stroke="#7c3aed" strokeWidth="1.2"/>
    <path d="M16 6h3v12h-3z" stroke="#7c3aed" strokeWidth="1.2"/>
  </svg>
);

export const PeopleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="9" cy="8" r="2" fill="#7c3aed" />
    <path d="M3 20a6 6 0 0 1 12 0" fill="#7c3aed" />
    <circle cx="18" cy="9" r="1.5" fill="#7c3aed" />
  </svg>
);

export const GiftIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7" stroke="#f472b6" strokeWidth="1.2"/>
    <path d="M12 5v7" stroke="#f472b6" strokeWidth="1.2"/>
  </svg>
);

export const ExpenseIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2v20" stroke="#10b981" strokeWidth="1.2"/>
    <circle cx="12" cy="12" r="3" fill="#10b981"/>
  </svg>
);

export const HomeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} fill="#374151" viewBox="0 0 24 24">
    <path d="M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8z"/>
  </svg>
);

export const ProfileIcon = ({ size = 18 }) => (
  <svg width={size} height={size} fill="#374151" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="3" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

/* -----------------------------
      LOCK & PLAY ICONS
------------------------------ */

export function LockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function PlayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3.868v16.264A1 1 0 0 0 6.592 21.3L19.2 13.5a1 1 0 0 0 0-1.7L6.592 2.7A1 1 0 0 0 5 3.868z" />
    </svg>
  );
}
