import React from 'react';
import { HomeIcon, BarIcon, BookIcon, PeopleIcon, ProfileIcon } from './Icons';

export default function NavBar({ active = 'home', onChange = () => {} }) {
  const items = [
    { key: 'home', label: 'Home', Icon: HomeIcon },
    { key: 'expenses', label: 'Expenses', Icon: BarIcon },
    { key: 'lessons', label: 'Lessons', Icon: BookIcon },
    { key: 'community', label: 'Community', Icon: PeopleIcon },
    { key: 'profile', label: 'Profile', Icon: ProfileIcon },
  ];

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        background: 'white',
        boxShadow: '0 -4px 14px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000,
        padding: '0 10px'
      }}
    >
      <div
        className="bottom-inner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {items.map(item => {
          const isActive = item.key === active;
          const Icon = item.Icon;

          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                padding: '6px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: '0.25s ease',
                color: isActive ? 'var(--purple)' : '#6b7280',
              }}
            >
              <Icon size={20} />
              <div
                className="nav-label"
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
