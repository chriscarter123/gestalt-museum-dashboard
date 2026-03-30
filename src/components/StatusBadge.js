import React from 'react';

// Dispatch-style badges — colored dot · uppercase text · thin border
// Inspired by the Gestalt editorial design system
const CONFIGS = {
  up:       { dot: '#14B860', text: '#0a7a3e', border: 'rgba(20,184,96,0.25)',  bg: 'rgba(20,184,96,0.04)' },
  down:     { dot: '#E24B4A', text: '#9B1C1C', border: 'rgba(226,75,74,0.25)',  bg: 'rgba(226,75,74,0.04)' },
  flat:     { dot: '#9CA3AF', text: '#6B7280', border: 'rgba(17,24,39,0.12)',   bg: 'transparent' },
  active:   { dot: '#14B860', text: '#0a7a3e', border: 'rgba(20,184,96,0.25)',  bg: 'rgba(20,184,96,0.04)' },
  archived: { dot: '#9CA3AF', text: '#6B7280', border: 'rgba(17,24,39,0.1)',    bg: 'rgba(17,24,39,0.02)' },
  upcoming: { dot: '#D4AF37', text: '#7a5c10', border: 'rgba(212,175,55,0.3)',  bg: 'rgba(212,175,55,0.04)' },
  locked:   { dot: '#9CA3AF', text: '#6B7280', border: 'rgba(17,24,39,0.1)',    bg: 'rgba(17,24,39,0.02)' },
};

export default function StatusBadge({ label, dir = 'flat', size = 10 }) {
  const c = CONFIGS[dir] || CONFIGS.flat;
  const isLocked = dir === 'locked';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0,
      border: `1px solid ${c.border}`,
      borderRadius: 2,
      overflow: 'hidden',
      height: 22,
      background: c.bg,
      flexShrink: 0,
    }}>
      {/* Dot */}
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: '100%',
        flexShrink: 0,
      }}>
        {isLocked
          ? <span style={{ fontSize: 9 }}>🔒</span>
          : <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: c.dot, display: 'block', flexShrink: 0,
            }} />
        }
      </span>
      {/* Rule */}
      <span style={{ width: 1, height: 14, background: c.border, flexShrink: 0 }} />
      {/* Text */}
      <span style={{
        padding: '0 8px',
        fontSize: size,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: c.text,
        fontFamily: "'Outfit', sans-serif",
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </span>
  );
}
