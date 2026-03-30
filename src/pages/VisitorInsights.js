import React, { useState } from 'react';

const DAILY_SCANS = [
  { day: 'Mon', val: 4 },
  { day: 'Tue', val: 8 },
  { day: 'Wed', val: 11 },
  { day: 'Thu', val: 6 },
  { day: 'Fri', val: 5 },
  { day: 'Sat', val: 9 },
  { day: 'Sun', val: 4 },
];
const MAX_SCAN = Math.max(...DAILY_SCANS.map(d => d.val));

const ARTWORK_BREAKDOWN = [
  { title: 'Shore Sail Boat', scans: 24, pct: 51, lang: 'English' },
  { title: 'Harbor Fog',      scans: 15, pct: 32, lang: 'Spanish' },
  { title: 'Untitled No. 3', scans: 8,  pct: 17, lang: 'English' },
];

const LANGUAGES = [
  { lang: 'English', pct: 68 },
  { lang: 'Spanish', pct: 21 },
  { lang: 'French',  pct: 7 },
  { lang: 'Chinese', pct: 4 },
];

const RANGES = ['This week', 'This month', 'All time'];

function MetricCard({ label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '18px 20px', flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', fontFamily: "'Newsreader', serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function LockedState() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F4F6F3', padding: 32, fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 28, fontWeight: 400, color: '#111827', margin: 0 }}>Visitor Insights</h1>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Blurred placeholder behind the gate */}
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', marginBottom: 0, position: 'absolute', inset: 0, padding: 24, opacity: 0.4 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            {['47', '6.7', '12%', 'Shore Sail Boat'].map((v, i) => (
              <div key={i} style={{ flex: 1, background: '#F4F6F3', borderRadius: 8, height: 80 }} />
            ))}
          </div>
          <div style={{ background: '#F4F6F3', borderRadius: 8, height: 120 }} />
        </div>
        {/* Gate overlay */}
        <div style={{ position: 'relative', zIndex: 1, paddingTop: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 400, color: '#111827', margin: '0 0 8px' }}>
            Visitor Insights
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif", margin: '0 0 24px' }}>
            See how visitors are engaging with your artworks.<br/>Available on Gallery plan and above.
          </p>
          <button style={{
            padding: '10px 24px', background: '#14B860', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500,
          }}>
            Upgrade to Gallery — $99/mo
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VisitorInsights({ venue }) {
  const [range, setRange] = useState('This week');

  if (venue?.tier === 'starter') return <LockedState />;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#FCFCFC', padding: '28px 32px 32px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header — editorial */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        paddingBottom: 18, marginBottom: 24,
        borderBottom: '1px solid rgba(17,24,39,0.07)',
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(17,24,39,0.35)',
            fontFamily: "'Outfit', sans-serif", marginBottom: 8,
          }}>
            Insights
          </div>
          <h1 style={{
            fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 300,
            color: '#111827', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            Visitor Insights
          </h1>
          <div style={{ fontSize: 13, color: 'rgba(17,24,39,0.4)', marginTop: 5, fontFamily: "'Outfit', sans-serif" }}>
            {venue?.name || 'Your venue'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(17,24,39,0.12)', borderRadius: 2, overflow: 'hidden' }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '7px 14px', fontSize: 11, cursor: 'pointer', border: 'none',
              fontFamily: "'Outfit', sans-serif", fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              borderRight: r !== RANGES[RANGES.length - 1] ? '1px solid rgba(17,24,39,0.1)' : 'none',
              background: range === r ? '#111827' : 'transparent',
              color: range === r ? '#fff' : 'rgba(17,24,39,0.45)',
              transition: 'all 0.15s',
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <MetricCard label="Total scans" value="47" />
        <MetricCard label="Most-scanned artwork" value="Shore Sail Boat" />
        <MetricCard label="Avg. scans per day" value="6.7" />
        <MetricCard label="Return visitors" value="12%" />
      </div>

      {/* Daily scans bar chart */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>Daily Scans</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
          {DAILY_SCANS.map(({ day, val }) => (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 10, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>{val}</div>
              <div style={{
                width: '100%', height: `${(val / MAX_SCAN) * 72}px`,
                background: '#14B860', borderRadius: '3px 3px 0 0',
              }} />
              <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif" }}>{day}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginTop: 16, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
          47 total scans this week
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Artwork breakdown */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Artwork Breakdown</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {['Artwork', 'Scans', '% of total', 'Top language'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: '#9CA3AF', fontWeight: 500, padding: '0 0 10px', borderBottom: '1px solid #F3F4F6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ARTWORK_BREAKDOWN.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '10px 0', color: '#111827', borderBottom: '1px solid #F3F4F6' }}>{row.title}</td>
                  <td style={{ padding: '10px 8px', color: '#374151', borderBottom: '1px solid #F3F4F6' }}>{row.scans}</td>
                  <td style={{ padding: '10px 8px', color: '#374151', borderBottom: '1px solid #F3F4F6' }}>{row.pct}%</td>
                  <td style={{ padding: '10px 0', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.lang}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Language demand */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Language Demand</div>
          {LANGUAGES.map(({ lang, pct }) => (
            <div key={lang} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>{lang}</span>
                <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#14B860', borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#D4AF37', fontFamily: "'Outfit', sans-serif", marginTop: 16, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
            Top unmet request: Korean (3 requests)
          </div>
        </div>
      </div>
    </div>
  );
}
