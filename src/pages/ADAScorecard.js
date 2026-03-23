import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { institution, adaMetrics, galleries, audioPlays, languageDemand } from '../data/mockData';

const FLOORS = ['All floors', 'Ground', 'Floor 2', 'Floor 3'];

function ProgressBar({ pct }) {
  const color = pct >= 80 ? '#14B860' : pct >= 60 ? '#D4AF37' : '#E24B4A';
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }} />
    </div>
  );
}

function WheelchairDot({ pct }) {
  const color = pct >= 90 ? '#14B860' : pct >= 75 ? '#D4AF37' : '#E24B4A';
  return (
    <span>
      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 5 }} />
      {pct}%
    </span>
  );
}

const maxPlays = Math.max(...audioPlays.map(d => d.plays));

export default function ADAScorecard() {
  const [activeFloor, setActiveFloor] = useState('All floors');

  return (
    <PageShell
      title="ADA accessibility scorecard"
      subtitle={`${institution.name} · Updated ${institution.lastUpdated}`}
      actionLabel="Export PDF"
      onAction={() => alert('PDF export coming soon')}
    >
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {adaMetrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Gallery breakdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827' }}>
          Gallery breakdown
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FLOORS.map(f => (
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
          {galleries.map(g => (
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
                {g.artworks}
              </td>
              <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontFamily: "'Outfit', sans-serif" }}>
                {g.audioCoverage}%
              </td>
              <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', width: 120 }}>
                <ProgressBar pct={g.audioCoverage} />
              </td>
              <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontFamily: "'Outfit', sans-serif" }}>
                <WheelchairDot pct={g.wheelchair} />
              </td>
              <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#333', fontFamily: "'Outfit', sans-serif" }}>
                {g.arScore}
              </td>
              <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                <StatusBadge label={g.status} dir={g.statusDir} size={10} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Analytics strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
        {/* Audio plays bar chart */}
        <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
            Audio plays — last 7 days
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {audioPlays.map(d => (
              <div
                key={d.day}
                title={`${d.day}: ${d.plays}`}
                style={{
                  flex: 1, background: '#14B860', borderRadius: '3px 3px 0 0',
                  height: `${(d.plays / maxPlays) * 100}%`,
                  opacity: 0.7, transition: 'opacity 0.15s', cursor: 'default',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>
            {audioPlays.map(d => <span key={d.day}>{d.day}</span>)}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#888', fontFamily: "'Outfit', sans-serif" }}>
            1,428 total plays · <span style={{ color: '#14B860', fontWeight: 500 }}>+12% vs prior week</span>
          </div>
        </div>

        {/* Language demand */}
        <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
            Language demand
          </div>
          {languageDemand.map(l => (
            <div key={l.lang} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ width: 50, color: '#888' }}>{l.lang}</span>
              <div style={{ flex: 1, height: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${l.pct}%`, height: '100%', background: '#D4AF37', borderRadius: 3 }} />
              </div>
              <span style={{ width: 32, textAlign: 'right', color: '#888', fontSize: 11 }}>{l.pct}%</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 12, color: '#888', fontFamily: "'Outfit', sans-serif" }}>
            Top unmet request: <span style={{ color: '#D4AF37', fontWeight: 500 }}>Korean (34 requests)</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
