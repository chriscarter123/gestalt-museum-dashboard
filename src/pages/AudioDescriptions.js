import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { institution, audioMetrics, audioTracks } from '../data/mockData';

const TRACK_STATUS = {
  published: { label: 'Published', dir: 'up' },
  pending:   { label: 'Pending',   dir: 'flat' },
  missing:   { label: 'Missing',   dir: 'down' },
};

const FILTERS = ['All', 'Published', 'Pending', 'Missing'];

export default function AudioDescriptions() {
  const [filter, setFilter] = useState('All');

  const filtered = audioTracks.filter(t =>
    filter === 'All' || t.status.toLowerCase() === filter.toLowerCase()
  );

  return (
    <PageShell
      eyebrow="Accessibility"
      title="Audio descriptions"
      subtitle={`${institution.name} · Coverage overview`}
      actionLabel="Generate missing"
      onAction={() => alert('Batch generation coming soon')}
    >
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {audioMetrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Section header + filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px' }}>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827' }}>
          Track library
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
            {['Artwork', 'Artist', 'Lang', 'Duration', 'Source', 'Updated', 'Status', ''].map(h => (
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
          {filtered.map((t, i) => {
            const s = TRACK_STATUS[t.status] || TRACK_STATUS.missing;
            return (
              <tr
                key={i}
                onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'rgba(20,184,96,0.02)')}
                onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}
              >
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{t.artwork}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#555', fontFamily: "'Outfit', sans-serif" }}>{t.artist}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                    background: 'rgba(0,0,0,0.04)', fontSize: 10, fontWeight: 600,
                    color: '#555', letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif",
                  }}>{t.lang}</span>
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#888', fontFamily: "'Outfit', sans-serif" }}>{t.duration}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#888', fontFamily: "'Outfit', sans-serif" }}>
                  {t.source === 'AI' ? <span style={{ color: '#D4AF37', fontWeight: 500 }}>✦ AI</span> : t.source === 'Manual' ? 'Manual' : '—'}
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>{t.updatedAt}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <StatusBadge label={s.label} dir={s.dir} size={10} />
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {t.status === 'published' && (
                      <button style={{ padding: '3px 8px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#888', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>▶</button>
                    )}
                    {(t.status === 'missing' || t.status === 'pending') && (
                      <button style={{ padding: '3px 8px', borderRadius: 5, border: '0.5px solid rgba(20,184,96,0.3)', background: 'rgba(20,184,96,0.04)', color: '#14B860', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Generate</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PageShell>
  );
}
