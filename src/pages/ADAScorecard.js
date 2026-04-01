import React, { useState, useMemo } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { PlaceholderCard, PlaceholderMetricCard, EmptyPageState, LoadingSkeleton } from '../components/PlaceholderCard';
import { institution } from '../data/mockData';
import { deriveAudioCoverage, deriveGalleryBreakdown, deriveOverallArScore } from '../utils/deriveMetrics';

function ProgressBar({ pct }) {
  const color = pct >= 80 ? '#14B860' : pct >= 60 ? '#D4AF37' : '#E24B4A';
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }} />
    </div>
  );
}

export default function ADAScorecard({ artworks = [], artworksLoading = false }) {
  const [activeFloor, setActiveFloor] = useState('All floors');

  const audio = useMemo(() => deriveAudioCoverage(artworks), [artworks]);
  const galleries = useMemo(() => deriveGalleryBreakdown(artworks), [artworks]);
  const arScore = useMemo(() => deriveOverallArScore(artworks), [artworks]);

  const floors = ['All floors', ...new Set(galleries.map(g => g.name))];

  return (
    <PageShell
      eyebrow="Accessibility"
      title="ADA accessibility scorecard"
      subtitle={`${institution.name} · ${artworks.length} artworks`}
      actionLabel="Export PDF"
      onAction={() => alert('PDF export coming soon')}
    >
      {artworksLoading ? <LoadingSkeleton /> : artworks.length === 0 ? <EmptyPageState pageName="ADA scorecard" /> : (
        <>
          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            <MetricCard label="Audio descriptions" value={`${audio.percent}%`} detail={`${audio.covered} of ${audio.total} artworks`} trend={audio.percent >= 70 ? '+' : ''} trendDir={audio.percent >= 70 ? 'up' : 'down'} color="#14B860" pct={audio.percent} />
            <PlaceholderMetricCard label="Languages" systemName="analytics service" />
            <PlaceholderMetricCard label="Wheelchair access" systemName="facility database" />
            <MetricCard label="AR reliability" value={arScore != null ? arScore.toFixed(2) : '—'} detail={arScore != null ? 'Average score' : 'No AR data'} trend="" trendDir="flat" color="#D4AF37" pct={arScore ? arScore * 100 : 0} />
          </div>

          {/* Gallery breakdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827' }}>
              Gallery breakdown
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {floors.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFloor(f)}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 12,
                    border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    background: activeFloor === f ? '#111827' : '#fff',
                    color: activeFloor === f ? '#fff' : '#888',
                    borderColor: activeFloor === f ? '#111827' : 'rgba(0,0,0,0.1)',
                    transition: 'all 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Gallery', 'Artworks', 'Audio coverage', '', 'Wheelchair', 'AR score', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', fontWeight: 500, color: '#888',
                    padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                    fontFamily: "'Outfit', sans-serif",
                    width: h === '' ? 120 : undefined,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {galleries
                .filter(g => activeFloor === 'All floors' || g.name === activeFloor)
                .map(g => (
                <tr
                  key={g.name}
                  style={{ cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'rgba(20,184,96,0.02)')}
                  onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}
                >
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>
                    {g.name}
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontFamily: "'Outfit', sans-serif" }}>
                    {g.artworkCount}
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontFamily: "'Outfit', sans-serif" }}>
                    {g.audioCoveragePct}%
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', width: 120 }}>
                    <ProgressBar pct={g.audioCoveragePct} />
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>
                    —
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontFamily: "'Outfit', sans-serif" }}>
                    {g.avgArScore != null ? g.avgArScore : '—'}
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                    <StatusBadge label={g.status === 'up' ? 'Good' : g.status === 'flat' ? 'Partial' : 'Missing'} dir={g.status} size={10} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Analytics strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
            <PlaceholderCard icon="🔊" systemName="audio analytics" description="Track audio play counts across galleries over time" />
            <PlaceholderCard icon="🌐" systemName="language analytics" description="See which languages visitors request most" />
          </div>
        </>
      )}
    </PageShell>
  );
}
