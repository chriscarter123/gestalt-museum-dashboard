import React from 'react';

const STYLES = {
  up:       { color: '#14B860', background: 'rgba(20,184,96,0.08)' },
  down:     { color: '#E24B4A', background: 'rgba(226,75,74,0.08)' },
  flat:     { color: '#888',    background: 'rgba(0,0,0,0.04)' },
  active:   { color: '#0D7A3E', background: '#E8F7EF' },
  archived: { color: '#5F5E5A', background: '#F1EFE8' },
  upcoming: { color: '#3B6D11', background: '#EAF3DE' },
  locked:   { color: '#5F5E5A', background: '#F1EFE8' },
};

export default function StatusBadge({ label, dir = 'flat', size = 11 }) {
  const s = STYLES[dir] || STYLES.flat;
  const isLocked = dir === 'locked';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: size, fontWeight: 500,
      padding: '2px 6px', borderRadius: 4,
      color: s.color, background: s.background,
      fontFamily: "'Outfit', sans-serif",
    }}>
      {isLocked && <span style={{ fontSize: 10 }}>🔒</span>}{label}
    </span>
  );
}
