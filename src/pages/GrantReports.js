import React, { useState, useMemo } from 'react';
import PageShell from '../components/PageShell';
import { PlaceholderCard } from '../components/PlaceholderCard';
import { institution } from '../data/mockData';
import { deriveReportPreview } from '../utils/deriveMetrics';
import { generateReportPDF } from '../utils/generateReportPDF';

const REPORT_TYPES = [
  { id: 'ada_annual',    label: 'ADA Annual Compliance',     description: 'Comprehensive annual ADA compliance report for federal and state regulators.' },
  { id: 'audio',         label: 'Audio Coverage Assessment', description: 'Audio description coverage rates, generation pipeline metrics, and language demand.' },
  { id: 'accessibility', label: 'Accessibility Grant Summary', description: 'NEA and state arts council grant application supporting documentation.' },
  { id: 'ar_audit',      label: 'AR Reliability Audit',      description: 'AR anchor reliability scores, recalibration history, and recognition accuracy.' },
];

export default function GrantReports({ artworks = [], artworksLoading = false }) {
  const [reportType, setReportType] = useState('ada_annual');
  const [period, setPeriod] = useState('Q1 2026');

  const preview = useMemo(() => deriveReportPreview(artworks), [artworks]);
  const selectedReport = REPORT_TYPES.find(r => r.id === reportType);

  return (
    <PageShell
      eyebrow="Reporting"
      title="Grant reports"
      subtitle={`${institution.name}`}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: Builder */}
        <div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827', marginBottom: 14 }}>
            Generate report
          </div>

          {/* Report type selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {REPORT_TYPES.map(rt => (
              <div
                key={rt.id}
                onClick={() => setReportType(rt.id)}
                style={{
                  padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                  border: reportType === rt.id ? '1.5px solid #14B860' : '1px solid rgba(0,0,0,0.06)',
                  background: reportType === rt.id ? 'rgba(20,184,96,0.03)' : '#fff',
                  transition: 'all 0.15s', fontFamily: "'Outfit', sans-serif",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{rt.label}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{rt.description}</div>
              </div>
            ))}
          </div>

          {/* Period */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Period</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                display: 'block', width: '100%', marginTop: 6, padding: '8px 10px',
                borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13,
                fontFamily: "'Outfit', sans-serif", background: '#fff',
              }}
            >
              {['Q1 2026', 'FY 2025', 'Q4 2025', 'Q3 2025', 'FY 2024'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={() => generateReportPDF({
              reportType,
              reportLabel: selectedReport?.label || 'Report',
              period,
              institutionName: institution.name,
              artworks,
            })}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 8,
              background: '#111827', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export as PDF
          </button>
        </div>

        {/* Right: Preview + History */}
        <div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: '#111827', marginBottom: 14 }}>
            Preview — {selectedReport?.label}
          </div>

          {/* Preview card */}
          <div style={{
            background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10,
            padding: 20, marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: '#888', fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>
              {institution.name} · {period}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: "'Newsreader', serif" }}>{preview.totalArtworks}</div>
                <div style={{ fontSize: 11, color: '#888', fontFamily: "'Outfit', sans-serif" }}>Total artworks</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#14B860', fontFamily: "'Newsreader', serif" }}>{preview.audioCoveragePct}%</div>
                <div style={{ fontSize: 11, color: '#888', fontFamily: "'Outfit', sans-serif" }}>Audio coverage</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#D1D5DB', fontFamily: "'Newsreader', serif" }}>—</div>
                <div style={{ fontSize: 11, color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>Wheelchair access</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#D4AF37', fontFamily: "'Newsreader', serif" }}>{preview.avgArScore != null ? preview.avgArScore : '—'}</div>
                <div style={{ fontSize: 11, color: '#888', fontFamily: "'Outfit', sans-serif" }}>AR reliability</div>
              </div>
            </div>

            {/* AI summary placeholder */}
            <PlaceholderCard icon="✨" systemName="AI report writer" description="AI-generated compliance summary will appear here" />
          </div>

          {/* Report history placeholder */}
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
            Report history
          </div>
          <PlaceholderCard icon="📄" systemName="report storage" description="Generated reports will be listed here with download links" />
        </div>
      </div>
    </PageShell>
  );
}
