import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { institution, adaMetrics, galleries, reportHistory } from '../data/mockData';

const REPORT_TYPES = [
  { id: 'ada_annual',   label: 'ADA Annual Compliance', description: 'Full ADA Section 508 compliance summary with audio, accessibility, and AR metrics' },
  { id: 'audio',        label: 'Audio Coverage Assessment', description: 'Detailed breakdown of audio description coverage by gallery and language' },
  { id: 'accessibility',label: 'Accessibility Grant Summary', description: 'Grant-ready summary of accessibility improvements for NEA / state arts council submissions' },
  { id: 'ar_audit',     label: 'AR Reliability Audit', description: 'Per-anchor reliability scores, recalibration history, and below-threshold alerts' },
];

const HISTORY_STATUS = {
  final: { label: 'Final', dir: 'up' },
  draft: { label: 'Draft', dir: 'flat' },
};

export default function GrantReports() {
  const [reportType, setReportType] = useState('ada_annual');
  const [period, setPeriod] = useState('Q1 2026');

  const selectedReport = REPORT_TYPES.find(r => r.id === reportType);

  // Derived summary stats for preview
  const totalArtworks    = galleries.reduce((s, g) => s + g.artworks, 0);
  const audioCoverage    = Math.round(adaMetrics[0].pct);
  const wheelchairAccess = Math.round(adaMetrics[2].pct);
  const arReliability    = adaMetrics[3].value;

  return (
    <PageShell
      title="Grant reports"
      subtitle={`${institution.name} · ADA & accessibility reporting`}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: builder */}
        <div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827', marginBottom: 14 }}>
            Generate report
          </div>

          {/* Report type */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>Report type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REPORT_TYPES.map(r => (
                <div
                  key={r.id}
                  onClick={() => setReportType(r.id)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    border: reportType === r.id ? '1px solid rgba(20,184,96,0.4)' : '0.5px solid rgba(0,0,0,0.08)',
                    background: reportType === r.id ? 'rgba(20,184,96,0.04)' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: reportType === r.id ? '#14B860' : '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 2 }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}>
                    {r.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Period */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>Period</div>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 6,
                border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13,
                color: '#333', background: '#fff', fontFamily: "'Outfit', sans-serif",
                outline: 'none', cursor: 'pointer',
              }}
            >
              {['Q1 2026', 'FY 2025', 'Q4 2025', 'Q3 2025', 'FY 2024'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <button
            style={{
              width: '100%', padding: '11px 0', borderRadius: 8,
              background: '#111827', border: 'none', color: '#fff',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M4 12v2h8v-2"/><path d="M8 2v8"/><path d="M5 7l3 3 3-3"/>
            </svg>
            Export as PDF
          </button>
        </div>

        {/* Right: preview + history */}
        <div>
          {/* Preview */}
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827', marginBottom: 14 }}>
            Preview — {selectedReport?.label}
          </div>
          <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)', padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#aaa', fontFamily: "'Outfit', sans-serif", marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {institution.name} · {period}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total artworks',    value: totalArtworks, color: '#111827' },
                { label: 'Audio coverage',    value: `${audioCoverage}%`, color: '#14B860' },
                { label: 'Wheelchair access', value: `${wheelchairAccess}%`, color: '#14B860' },
                { label: 'AR reliability',    value: arReliability, color: '#D4AF37' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 12px', background: '#f9f9f8', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: 24, fontWeight: 600, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(20,184,96,0.04)', borderRadius: 8, border: '0.5px solid rgba(20,184,96,0.2)' }}>
              <div style={{ fontSize: 11, color: '#14B860', fontWeight: 500, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
                ✦ AI summary
              </div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}>
                The Philadelphia Museum of Art has achieved a <strong>73% audio description coverage rate</strong> this period, up 5% from the prior 30 days. Wheelchair accessibility stands at 91% across all venues. AR recognition reliability averages 0.74, with 12 anchors flagged for recalibration.
              </div>
            </div>
          </div>

          {/* Report history */}
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
            Report history
          </div>
          <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {reportHistory.map((r, i) => {
              const s = HISTORY_STATUS[r.status] || HISTORY_STATUS.final;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: i < reportHistory.length - 1 ? '0.5px solid rgba(0,0,0,0.05)' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,96,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa', fontFamily: "'Outfit', sans-serif", marginTop: 1 }}>{r.period} · {r.generated}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge label={s.label} dir={s.dir} size={10} />
                    <button style={{ padding: '3px 10px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#888', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                      ↓ PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
