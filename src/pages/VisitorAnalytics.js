import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import PageShell from '../components/PageShell';
import { institution, visitorMetrics, visitorsByDay, galleryTraffic, deviceBreakdown } from '../data/mockData';

const RANGES = ['7 days', '30 days', '90 days'];
const maxVisitors = Math.max(...visitorsByDay.map(d => d.count));

export default function VisitorAnalytics() {
  const [range, setRange] = useState('7 days');

  return (
    <PageShell
      title="Visitor analytics"
      subtitle={`${institution.name} · Live data`}
      actionLabel="Export CSV"
      onAction={() => alert('CSV export coming soon')}
    >
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {visitorMetrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Visitors over time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px' }}>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827' }}>
          Daily visitors
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 12,
              border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              background: range === r ? '#111827' : '#fff',
              color: range === r ? '#fff' : '#888',
              borderColor: range === r ? '#111827' : 'rgba(0,0,0,0.1)',
              transition: 'all 0.15s',
            }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)', padding: 20, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
          {visitorsByDay.map(d => (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <div
                title={`${d.day}: ${d.count} visitors`}
                style={{
                  width: '100%', background: '#14B860', borderRadius: '3px 3px 0 0',
                  height: `${(d.count / maxVisitors) * 100}%`,
                  opacity: 0.75, transition: 'opacity 0.15s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0.75; }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {visitorsByDay.map(d => (
            <div key={d.day} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>{d.day}</div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#888', fontFamily: "'Outfit', sans-serif" }}>
          12,847 total this month · <span style={{ color: '#14B860', fontWeight: 500 }}>+8% vs prior period</span>
        </div>
      </div>

      {/* Gallery traffic + device split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        {/* Gallery traffic */}
        <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>
            Traffic by gallery
          </div>
          {galleryTraffic.map(g => (
            <div key={g.name} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
                <span style={{ color: '#333' }}>{g.name}</span>
                <span style={{ color: '#888' }}>{g.visitors.toLocaleString()}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${g.pct}%`, height: '100%', background: '#14B860', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Device breakdown */}
        <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>
            Device breakdown
          </div>
          {/* Stacked bar */}
          <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
            {deviceBreakdown.map(d => (
              <div key={d.label} style={{ width: `${d.pct}%`, background: d.color }} title={`${d.label}: ${d.pct}%`} />
            ))}
          </div>
          {deviceBreakdown.map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: '#333' }}>{d.label}</span>
              <span style={{ color: '#888', fontWeight: 500 }}>{d.pct}%</span>
            </div>
          ))}
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: '0.5px solid rgba(0,0,0,0.06)', fontSize: 12, color: '#888', fontFamily: "'Outfit', sans-serif" }}>
            iOS app adoption: <span style={{ color: '#14B860', fontWeight: 500 }}>+6% ↑ 30d</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
