import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { institution, anchorMetrics, anchors } from '../data/mockData';

const ANCHOR_STATUS = {
  calibrated:           { label: 'Calibrated',        dir: 'up' },
  needs_recalibration:  { label: 'Needs recal.',       dir: 'down' },
  flagged:              { label: 'Flagged',             dir: 'down' },
};

const FILTERS = ['All', 'Calibrated', 'Needs recalibration', 'Flagged'];

function ReliabilityBar({ score }) {
  const color = score >= 0.75 ? '#14B860' : score >= 0.5 ? '#D4AF37' : '#E24B4A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color, fontFamily: "'Outfit', sans-serif" }}>{score}</span>
    </div>
  );
}

export default function ARAnchors() {
  const [filter, setFilter] = useState('All');

  const filtered = anchors.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Calibrated') return a.status === 'calibrated';
    if (filter === 'Needs recalibration') return a.status === 'needs_recalibration';
    if (filter === 'Flagged') return a.status === 'flagged';
    return true;
  });

  return (
    <PageShell
      eyebrow="Technology"
      title="AR anchors"
      subtitle={`${institution.name} · Recognition reliability`}
      actionLabel="Run calibration"
      onAction={() => alert('Calibration sweep coming soon')}
    >
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {anchorMetrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Threshold callout */}
      <div style={{
        background: 'rgba(226,75,74,0.05)', border: '0.5px solid rgba(226,75,74,0.2)',
        borderRadius: 8, padding: '10px 14px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div style={{ fontSize: 12, color: '#333', fontFamily: "'Outfit', sans-serif" }}>
          <span style={{ fontWeight: 600, color: '#E24B4A' }}>12 anchors</span> are below the 0.5 recognition threshold and may fail to identify artworks.{' '}
          <span style={{ color: '#14B860', cursor: 'pointer', fontWeight: 500 }}>Schedule recalibration →</span>
        </div>
      </div>

      {/* Filter pills + table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px' }}>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827' }}>
          Anchor registry
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 12,
              border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              background: filter === f ? '#111827' : '#fff',
              color: filter === f ? '#fff' : '#888',
              borderColor: filter === f ? '#111827' : 'rgba(0,0,0,0.1)',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Gallery', 'Artwork', 'Anchor ID', 'Reliability', 'Last calibrated', 'Status', ''].map(h => (
              <th key={h} style={{
                textAlign: 'left', fontWeight: 500, color: '#888',
                padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                fontFamily: "'Outfit', sans-serif",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(a => {
            const s = ANCHOR_STATUS[a.status] || ANCHOR_STATUS.calibrated;
            return (
              <tr
                key={a.id}
                onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'rgba(20,184,96,0.02)')}
                onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}
              >
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#555', fontFamily: "'Outfit', sans-serif", maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.gallery}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{a.artwork}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888', background: 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: 3 }}>{a.id}</span>
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <ReliabilityBar score={a.reliability} />
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>{a.calibrated}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <StatusBadge label={s.label} dir={s.dir} size={10} />
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  {a.status !== 'calibrated' && (
                    <button style={{ padding: '3px 10px', borderRadius: 5, border: '0.5px solid rgba(20,184,96,0.3)', background: 'rgba(20,184,96,0.04)', color: '#14B860', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                      Recalibrate
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PageShell>
  );
}
