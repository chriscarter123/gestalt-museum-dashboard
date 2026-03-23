import React from 'react';
import RingChart from './RingChart';
import StatusBadge from './StatusBadge';

export default function MetricCard({ label, value, detail, trend, trendDir, color, pct }) {
  const accentMap = { '#14B860': 'green', '#D4AF37': 'yellow', '#E24B4A': 'red' };
  const accent = accentMap[color] || 'green';

  const accentColors = { green: '#14B860', yellow: '#D4AF37', red: '#E24B4A' };

  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      border: '0.5px solid rgba(0,0,0,0.06)',
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2.5,
        borderRadius: '10px 10px 0 0',
        background: accentColors[accent],
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: 11, color: '#888', fontWeight: 500,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            fontFamily: "'Outfit', sans-serif",
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 28, fontWeight: 600, color: '#111827',
            margin: '6px 0 2px',
          }}>
            {value}
          </div>
          <div style={{ fontSize: 12, color: '#888', fontFamily: "'Outfit', sans-serif" }}>
            {detail}
          </div>
        </div>
        <RingChart pct={pct} color={color} label={value.length > 3 ? '' : value} />
      </div>

      <div style={{ marginTop: 8 }}>
        <StatusBadge label={trend} dir={trendDir} />
      </div>
    </div>
  );
}
