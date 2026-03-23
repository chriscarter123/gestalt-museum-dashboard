import React from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 28; // r=28

export default function RingChart({ pct, color, label }) {
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
        <circle
          cx="32" cy="32" r="28" fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.175,0.885,0.32,1.275)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 600, color,
        fontFamily: "'Newsreader', serif",
      }}>
        {label}
      </div>
    </div>
  );
}
