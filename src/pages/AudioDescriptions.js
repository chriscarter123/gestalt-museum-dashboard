import React, { useState, useMemo } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { PlaceholderMetricCard, EmptyPageState, LoadingSkeleton } from '../components/PlaceholderCard';
import { institution } from '../data/mockData';
import { deriveAudioCounts, deriveAudioTrackRows } from '../utils/deriveMetrics';

const TRACK_STATUS = {
  published: { label: 'Published', dir: 'up' },
  pending:   { label: 'Pending',   dir: 'flat' },
  missing:   { label: 'Missing',   dir: 'down' },
};
const FILTERS = ['All', 'Published', 'Pending', 'Missing'];

export default function AudioDescriptions({ artworks = [], artworksLoading = false }) {
  const [filter, setFilter] = useState('All');

  const counts = useMemo(() => deriveAudioCounts(artworks), [artworks]);
  const tracks = useMemo(() => deriveAudioTrackRows(artworks), [artworks]);

  const filtered = tracks.filter(t =>
    filter === 'All' || t.status.toLowerCase() === filter.toLowerCase()
  );

  return (
    <PageShell
      eyebrow="Accessibility"
      title="Audio descriptions"
      subtitle={`${institution.name} · ${artworks.length} artworks`}
    >
      {artworksLoading ? <LoadingSkeleton /> : artworks.length === 0 ? <EmptyPageState pageName="audio descriptions" /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            <MetricCard label="Covered" value={counts.covered} detail={`${counts.total > 0 ? Math.round((counts.covered / counts.total) * 100) : 0}% of collection`} trend="" trendDir="up" color="#14B860" pct={counts.total > 0 ? (counts.covered / counts.total) * 100 : 0} />
            <MetricCard label="Pending generation" value={counts.pending} detail="Audio script only" trend="" trendDir="flat" color="#D4AF37" pct={counts.total > 0 ? (counts.pending / counts.total) * 100 : 0} />
            <MetricCard label="Missing" value={counts.missing} detail="No audio content" trend="" trendDir="down" color="#E24B4A" pct={counts.total > 0 ? (counts.missing / counts.total) * 100 : 0} />
            <PlaceholderMetricCard label="Languages" systemName="audio service" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827' }}>Track library</div>
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
                {['Artwork', 'Artist', 'Lang', 'Duration', 'Source', 'Updated', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontWeight: 500, color: '#888', padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const st = TRACK_STATUS[t.status] || { label: t.status, dir: 'flat' };
                return (
                  <tr key={t.id} style={{ cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'rgba(20,184,96,0.02)')}
                    onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>{t.artwork}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#666', fontFamily: "'Outfit', sans-serif" }}>{t.artist}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(0,0,0,0.04)', borderRadius: 4, color: '#888' }}>{t.lang}</span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#888', fontFamily: "'Outfit', sans-serif" }}>{t.duration}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', fontFamily: "'Outfit', sans-serif" }}>
                      {t.source.includes('AI') ? <span style={{ color: '#D4AF37', fontWeight: 500 }}>✦ AI</span> : <span style={{ color: '#aaa' }}>{t.source}</span>}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>{t.updatedAt}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}><StatusBadge label={st.label} dir={st.dir} size={10} /></td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                      {t.audioUrl ? (
                        <button onClick={() => { const a = new Audio(t.audioUrl); a.play(); }} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, border: '0.5px solid rgba(20,184,96,0.3)', background: 'rgba(20,184,96,0.06)', color: '#14B860', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>▶ Play</button>
                      ) : (
                        <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.1)', background: '#fff', color: '#888', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Generate</button>
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
