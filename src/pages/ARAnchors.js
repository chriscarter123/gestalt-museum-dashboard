import React, { useState, useMemo } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { PlaceholderMetricCard, EmptyPageState, LoadingSkeleton } from '../components/PlaceholderCard';
import { institution } from '../data/mockData';
import { deriveAnchorRows, deriveAnchorCounts } from '../utils/deriveMetrics';

const ANCHOR_STATUS = {
  calibrated:           { label: 'Calibrated',   dir: 'up' },
  needs_recalibration:  { label: 'Needs recal.', dir: 'down' },
  flagged:              { label: 'Flagged',       dir: 'down' },
  unknown:              { label: 'Unknown',       dir: 'flat' },
};
const FILTERS = ['All', 'Calibrated', 'Needs recalibration', 'Flagged'];

function ReliabilityBar({ score }) {
  if (score == null) return <span style={{ color: '#aaa', fontSize: 11 }}>—</span>;
  const pct = Math.round(score * 100);
  const color = score >= 0.75 ? '#14B860' : score >= 0.5 ? '#D4AF37' : '#E24B4A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 500 }}>{score.toFixed(2)}</span>
    </div>
  );
}

export default function ARAnchors({ artworks = [], artworksLoading = false }) {
  const [filter, setFilter] = useState('All');

  const counts = useMemo(() => deriveAnchorCounts(artworks), [artworks]);
  const rows = useMemo(() => deriveAnchorRows(artworks), [artworks]);

  const filtered = rows.filter(a => {
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
      subtitle={`${institution.name} · ${counts.total} anchors`}
    >
      {artworksLoading ? <LoadingSkeleton /> : artworks.length === 0 ? <EmptyPageState pageName="AR anchors" /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            <MetricCard label="Total anchors" value={counts.total} detail="Artworks with AR data" trend="" trendDir="flat" color="#14B860" pct={100} />
            {counts.avgScore != null ? (
              <MetricCard label="Avg reliability" value={counts.avgScore.toFixed(2)} detail="Mean AR score" trend="" trendDir={counts.avgScore >= 0.7 ? 'up' : 'down'} color="#D4AF37" pct={counts.avgScore * 100} />
            ) : (
              <PlaceholderMetricCard label="Avg reliability" systemName="AR calibration" />
            )}
            <MetricCard label="Below threshold" value={counts.belowThreshold} detail="Score < 0.50" trend="" trendDir={counts.belowThreshold > 0 ? 'down' : 'up'} color="#E24B4A" pct={counts.total > 0 ? (counts.belowThreshold / counts.total) * 100 : 0} />
            <PlaceholderMetricCard label="Calibrated today" systemName="calibration service" />
          </div>

          {counts.belowThreshold > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 20,
              background: 'rgba(226,75,74,0.04)', border: '1px solid rgba(226,75,74,0.15)',
              fontSize: 13, color: '#E24B4A', fontFamily: "'Outfit', sans-serif",
            }}>
              ⚠ {counts.belowThreshold} anchor{counts.belowThreshold > 1 ? 's' : ''} below 0.50 reliability threshold
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827' }}>Anchor registry</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  background: filter === f ? '#111827' : '#fff', color: filter === f ? '#fff' : '#888', borderColor: filter === f ? '#111827' : 'rgba(0,0,0,0.1)', transition: 'all 0.15s',
                }}>{f}</button>
              ))}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Gallery', 'Artwork', 'Anchor ID', 'Reliability', 'Last calibrated', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontWeight: 500, color: '#888', padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const st = ANCHOR_STATUS[a.status] || { label: a.status, dir: 'flat' };
                return (
                  <tr key={a.id} style={{ cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'rgba(20,184,96,0.02)')}
                    onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>{a.gallery}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontFamily: "'Outfit', sans-serif" }}>{a.artwork}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(0,0,0,0.03)', borderRadius: 4, fontFamily: 'monospace', color: '#888' }}>{a.anchorId}</span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}><ReliabilityBar score={a.reliability} /></td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>{a.calibrated}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}><StatusBadge label={st.label} dir={st.dir} size={10} /></td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                      {a.status !== 'calibrated' && (
                        <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.1)', background: '#fff', color: '#888', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Recalibrate</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </PageShell>
  );
}
