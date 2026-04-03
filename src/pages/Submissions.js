/**
 * Submissions.js — Community Contributions review queue
 *
 * Shows every document in the `submissions` Firestore collection.
 * Admins can:
 *   - Filter by status (pending_review, auto_approved, approved, rejected)
 *   - See trust score, photo thumbnail, attribution, AI labels
 *   - Open a detail drawer with the full trust breakdown
 *   - Approve (promotes to `artworks`) or Reject individual submissions
 */

import React, { useState } from 'react';
import PageShell from '../components/PageShell';
import { approveSubmission, rejectSubmission } from '../services/submissionService';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—';
  // Firestore Timestamp or ISO string
  const d = val?.toDate ? val.toDate() : new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function trustColor(score) {
  if (score == null) return '#ccc';
  if (score >= 0.75) return '#14B860';
  if (score >= 0.5)  return '#D4AF37';
  return '#E24B4A';
}

// ── Trust score bar ──────────────────────────────────────────────────────────

function TrustBar({ score }) {
  const color = trustColor(score);
  const pct = score != null ? Math.round(score * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 56, height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "'Outfit', sans-serif", fontWeight: 600, minWidth: 28 }}>
        {score != null ? `${pct}%` : '—'}
      </span>
    </div>
  );
}

// ── Status pill ──────────────────────────────────────────────────────────────

const STATUS_META = {
  pending:        { label: 'Pending',       bg: 'rgba(17,24,39,0.06)', color: '#888' },
  pending_review: { label: 'Needs review',  bg: '#FEF3C7',              color: '#92400E' },
  auto_approved:  { label: 'Auto-approved', bg: 'rgba(20,184,96,0.1)',  color: '#14B860' },
  approved:       { label: 'Approved',      bg: 'rgba(20,184,96,0.1)',  color: '#14B860' },
  rejected:       { label: 'Rejected',      bg: 'rgba(226,75,74,0.08)', color: '#E24B4A' },
};

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      background: m.bg, color: m.color,
      fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}

// ── Trust breakdown table (shown in detail drawer) ───────────────────────────

const BREAKDOWN_LABELS = {
  photo:            'Photo quality',
  gps:              'GPS data',
  compass:          'Compass heading',
  title:            'Title provided',
  artist:           'Artist provided',
  year:             'Year provided',
  medium:           'Medium provided',
  description:      'Description',
  ai_vision:        'AI vision match',
  ai_reverse_image: 'Reverse image search',
  voice:            'Voice transcript',
  first_finder:     'First finder bonus',
  reputation_boost: 'Reputation boost',
};

function TrustBreakdown({ breakdown }) {
  const entries = Object.entries(breakdown).filter(([, v]) => v != null);
  if (entries.length === 0) return (
    <p style={{ fontSize: 12, color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>No breakdown data.</p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {entries.map(([key, val]) => {
        const pct = Math.round(val * 100);
        const color = trustColor(val);
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 130, fontSize: 11, color: '#555', fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>
              {BREAKDOWN_LABELS[key] || key}
            </span>
            <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, color, fontFamily: "'Outfit', sans-serif", fontWeight: 600, minWidth: 28, textAlign: 'right' }}>
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Detail drawer ────────────────────────────────────────────────────────────

function SubmissionDrawer({ submission, onClose, onApprove, onReject, loading }) {
  const { attribution, trust_breakdown, ai_classification, location, voice_transcript } = submission;
  const aiLabels = ai_classification?.stage1_labels || ai_classification?.labels || [];
  const mapUrl = location?.lat && location?.lng
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : null;

  const isPending = ['pending', 'pending_review'].includes(submission.status);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: '#fff', zIndex: 101, overflowY: 'auto',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '0.5px solid rgba(0,0,0,0.07)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.35)', marginBottom: 6 }}>
              Contribution
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 20, fontWeight: 300, color: '#111827', lineHeight: 1.15 }}>
              {attribution?.title || 'Untitled'}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{attribution?.artist || 'Unknown artist'}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: '#aaa', padding: 4, lineHeight: 1, flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Photo */}
          {submission.photo_url && (
            <div style={{ borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', aspectRatio: '4/3' }}>
              <img
                src={submission.photo_url}
                alt={attribution?.title || 'Contributed artwork'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* Status + trust score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusPill status={submission.status} />
            {submission.trust_score != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#aaa' }}>Trust</span>
                <TrustBar score={submission.trust_score} />
              </div>
            )}
            {submission.is_first_finder && (
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 20,
                background: 'rgba(212,175,55,0.12)', color: '#D4AF37',
                fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                First finder
              </span>
            )}
          </div>

          {/* Attribution */}
          <section>
            <SectionLabel>Attribution</SectionLabel>
            <InfoGrid rows={[
              ['Year',      attribution?.year        || '—'],
              ['Medium',    attribution?.medium      || '—'],
              ['Condition', attribution?.condition   || '—'],
              ['Notes',     attribution?.notes       || '—'],
            ]} />
            {attribution?.description && (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                {attribution.description}
              </p>
            )}
          </section>

          {/* Trust breakdown */}
          {Object.keys(trust_breakdown).length > 0 && (
            <section>
              <SectionLabel>Trust breakdown</SectionLabel>
              <TrustBreakdown breakdown={trust_breakdown} />
            </section>
          )}

          {/* AI classification */}
          {aiLabels.length > 0 && (
            <section>
              <SectionLabel>AI labels</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {aiLabels.map((label, i) => (
                  <span key={i} style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 20,
                    background: 'rgba(17,24,39,0.05)', color: '#555',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {label}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Voice transcript */}
          {voice_transcript && (
            <section>
              <SectionLabel>Voice transcript</SectionLabel>
              <p style={{ margin: 0, fontSize: 12, color: '#555', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{voice_transcript}"
              </p>
            </section>
          )}

          {/* Location */}
          <section>
            <SectionLabel>Location</SectionLabel>
            {location?.lat ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#555', fontFamily: 'monospace' }}>
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: '#14B860', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Open in Maps ↗
                  </a>
                )}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: '#aaa' }}>No GPS data</span>
            )}
            {submission.compass_heading != null && (
              <div style={{ marginTop: 4, fontSize: 11, color: '#aaa' }}>
                Compass: {Math.round(submission.compass_heading)}°
              </div>
            )}
          </section>

          {/* Contributor */}
          <section>
            <SectionLabel>Contributor</SectionLabel>
            <InfoGrid rows={[
              ['Email', submission.contributor_email || '—'],
              ['Submitted', formatDate(submission.submitted_at)],
              ['Captured',  formatDate(submission.captured_at)],
            ]} />
          </section>
        </div>

        {/* Action footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '0.5px solid rgba(0,0,0,0.07)',
          display: 'flex', gap: 10,
          flexShrink: 0, background: '#fff',
        }}>
          {isPending ? (
            <>
              <button
                onClick={onApprove}
                disabled={loading}
                style={{
                  flex: 1, padding: '11px 0',
                  background: '#14B860', color: '#fff',
                  border: 'none', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Saving…' : 'Approve'}
              </button>
              <button
                onClick={onReject}
                disabled={loading}
                style={{
                  flex: 1, padding: '11px 0',
                  background: 'transparent', color: '#E24B4A',
                  border: '1px solid rgba(226,75,74,0.3)', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'opacity 0.15s',
                }}
              >
                Reject
              </button>
            </>
          ) : (
            <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', flex: 1 }}>
              This submission has been <strong style={{ color: '#555' }}>{submission.status}</strong>.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Small shared helpers ──────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 600, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: 'rgba(17,24,39,0.35)',
      fontFamily: "'Outfit', sans-serif", marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function InfoGrid({ rows }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 5 }}>
      {rows.map(([label, value]) => (
        <React.Fragment key={label}>
          <span style={{ fontSize: 11, color: '#aaa', fontFamily: "'Outfit', sans-serif" }}>{label}</span>
          <span style={{ fontSize: 12, color: '#374151', fontFamily: "'Outfit', sans-serif", wordBreak: 'break-word' }}>{value}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 0', textAlign: 'center',
    }}>
      <svg width={64} height={64} viewBox="0 0 64 64" fill="none" style={{ marginBottom: 16, opacity: 0.25 }}>
        <circle cx="32" cy="28" r="14" stroke="#374151" strokeWidth="2.5"/>
        <path d="M18 56c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M44 20l6-6M44 14l6 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize: 16, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>
        {filtered ? 'No submissions match your filters' : 'No contributions yet'}
      </div>
      <div style={{ fontSize: 13, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", maxWidth: 300, lineHeight: 1.5 }}>
        {filtered
          ? 'Try adjusting your status or trust score filter.'
          : 'When visitors photograph artwork using the Gestalt mobile app, their submissions will appear here for review.'}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ALL_STATUSES = ['All', 'pending_review', 'auto_approved', 'approved', 'rejected'];
const STATUS_LABELS = {
  All: 'All statuses',
  pending_review: 'Needs review',
  auto_approved:  'Auto-approved',
  approved:       'Approved',
  rejected:       'Rejected',
};

export default function Submissions({ submissions = [], submissionsLoading, uid, venueId }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [minTrust, setMinTrust]         = useState(0);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Counts for summary strip ────────────────────────────────────────────
  const total         = submissions.length;
  const needsReview   = submissions.filter(s => s.status === 'pending_review').length;
  const autoApproved  = submissions.filter(s => s.status === 'auto_approved').length;
  const approved      = submissions.filter(s => s.status === 'approved').length;
  const rejected      = submissions.filter(s => s.status === 'rejected').length;

  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered = submissions.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (s.trust_score != null && s.trust_score < minTrust) return false;
    if (search) {
      const q = search.toLowerCase();
      const title  = (s.attribution?.title  || '').toLowerCase();
      const artist = (s.attribution?.artist || '').toLowerCase();
      if (!title.includes(q) && !artist.includes(q)) return false;
    }
    return true;
  });

  // ── Actions ─────────────────────────────────────────────────────────────
  async function handleApprove() {
    if (!selected) return;
    setActionLoading(true);
    try {
      await approveSubmission(selected.id, selected, venueId || null, uid);
      setSelected(null);
    } catch (e) {
      console.error('[Submissions] Approve failed:', e.message);
      alert(`Could not approve: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selected) return;
    setActionLoading(true);
    try {
      await rejectSubmission(selected.id, uid);
      setSelected(null);
    } catch (e) {
      console.error('[Submissions] Reject failed:', e.message);
      alert(`Could not reject: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  const selectStyle = {
    padding: '6px 10px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)',
    fontSize: 12, color: '#333', background: '#fff', cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif", outline: 'none',
  };

  return (
    <PageShell
      eyebrow="Community"
      title="Contributions"
      subtitle={`${total} total · ${needsReview} need${needsReview === 1 ? 's' : ''} review`}
    >
      {submissionsLoading ? (
        <div style={{ textAlign: 'center', padding: 64, color: '#9CA3AF', fontSize: 14 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            border: '2px solid #E5E7EB', borderTopColor: '#14B860',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
          }} />
          Loading contributions…
        </div>
      ) : (
        <>
          {/* Summary strip */}
          {total > 0 && (
            <div style={{
              display: 'flex', gap: 20, marginBottom: 20,
              padding: '12px 16px', background: '#fff',
              borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)',
            }}>
              {[
                { label: 'Total',         value: total,        color: '#111827' },
                { label: 'Needs review',  value: needsReview,  color: '#92400E'  },
                { label: 'Auto-approved', value: autoApproved, color: '#D4AF37'  },
                { label: 'Approved',      value: approved,     color: '#14B860'  },
                { label: 'Rejected',      value: rejected,     color: '#E24B4A'  },
              ].map(s => (
                <div key={s.label} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(
                  s.label === 'Total' ? 'All' :
                  s.label === 'Needs review' ? 'pending_review' :
                  s.label === 'Auto-approved' ? 'auto_approved' :
                  s.label.toLowerCase()
                )}>
                  <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif" }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 600, color: s.color }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              placeholder="Search title or artist…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...selectStyle, flex: '1 1 180px', minWidth: 180 }}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select
              value={minTrust}
              onChange={e => setMinTrust(Number(e.target.value))}
              style={selectStyle}
            >
              <option value={0}>All trust scores</option>
              <option value={0.5}>≥ 50% trust</option>
              <option value={0.75}>≥ 75% trust</option>
            </select>
          </div>

          {/* Table / empty state */}
          {filtered.length === 0 ? (
            <EmptyState filtered={total > 0} />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Photo', 'Title / Artist', 'Location', 'Trust', 'Status', 'Date', ''].map(h => (
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
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'rgba(20,184,96,0.02)')}
                    onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}
                  >
                    {/* Thumbnail */}
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', width: 52 }}>
                      {s.photo_url ? (
                        <div style={{
                          width: 40, height: 40, borderRadius: 6,
                          overflow: 'hidden', background: '#f3f4f6', flexShrink: 0,
                        }}>
                          <img
                            src={s.photo_url}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: 6,
                          background: '#f3f4f6', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#ddd', fontSize: 18,
                        }}>
                          ◉
                        </div>
                      )}
                    </td>

                    {/* Title / Artist */}
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 1 }}>
                        {s.attribution?.title || 'Untitled'}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', fontFamily: "'Outfit', sans-serif" }}>
                        {s.attribution?.artist || '—'}
                      </div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#888', fontFamily: 'monospace', fontSize: 11 }}>
                      {s.location?.lat
                        ? `${s.location.lat.toFixed(4)}, ${s.location.lng.toFixed(4)}`
                        : '—'}
                    </td>

                    {/* Trust */}
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                      <TrustBar score={s.trust_score} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                      <StatusPill status={s.status} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#aaa', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                      {formatDate(s.submitted_at)}
                    </td>

                    {/* Row action */}
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', textAlign: 'right' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(s); }}
                        style={{
                          padding: '3px 10px', borderRadius: 5,
                          border: '0.5px solid rgba(0,0,0,0.1)',
                          background: 'transparent', color: '#888',
                          fontSize: 11, cursor: 'pointer',
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <SubmissionDrawer
          submission={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
          uid={uid}
          venueId={venueId}
        />
      )}
    </PageShell>
  );
}
