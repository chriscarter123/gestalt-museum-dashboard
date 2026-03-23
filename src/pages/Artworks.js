import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { institution, artworksList } from '../data/mockData';

const STATUS_STYLES = {
  active:       { label: 'Active',       dir: 'up' },
  unverified:   { label: 'Unverified',   dir: 'flat' },
  deteriorating:{ label: 'Deteriorating',dir: 'down' },
  removed:      { label: 'Removed',      dir: 'down' },
};

const ALL_GALLERIES = ['All galleries', ...new Set(artworksList.map(a => a.gallery))];
const ALL_TYPES     = ['All types',     ...new Set(artworksList.map(a => a.type))];
const ALL_STATUSES  = ['All statuses', 'active', 'unverified', 'deteriorating'];

function ARScoreBar({ score }) {
  const color = score >= 0.8 ? '#14B860' : score >= 0.6 ? '#D4AF37' : '#E24B4A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 48, height: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: '#888', fontFamily: "'Outfit', sans-serif" }}>{score}</span>
    </div>
  );
}

export default function Artworks() {
  const [search, setSearch]   = useState('');
  const [gallery, setGallery] = useState('All galleries');
  const [type, setType]       = useState('All types');
  const [status, setStatus]   = useState('All statuses');

  const filtered = artworksList.filter(a => {
    const matchSearch  = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.artist.toLowerCase().includes(search.toLowerCase());
    const matchGallery = gallery === 'All galleries' || a.gallery === gallery;
    const matchType    = type === 'All types' || a.type === type;
    const matchStatus  = status === 'All statuses' || a.status === status;
    return matchSearch && matchGallery && matchType && matchStatus;
  });

  const selectStyle = {
    padding: '6px 10px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)',
    fontSize: 12, color: '#333', background: '#fff', cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif", outline: 'none',
  };

  return (
    <PageShell
      title="Artworks"
      subtitle={`${institution.name} · ${artworksList.length} artworks`}
      actionLabel="Add artwork"
      onAction={() => alert('Add artwork coming soon')}
    >
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, padding: '12px 16px', background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)' }}>
        {[
          { label: 'Total', value: artworksList.length, color: '#111827' },
          { label: 'With audio', value: artworksList.filter(a => a.hasAudio).length, color: '#14B860' },
          { label: 'Missing audio', value: artworksList.filter(a => !a.hasAudio).length, color: '#E24B4A' },
          { label: 'Avg AR score', value: (artworksList.reduce((s, a) => s + a.arScore, 0) / artworksList.length).toFixed(2), color: '#D4AF37' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif" }}>{s.label}</div>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search title or artist…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...selectStyle, flex: '1 1 180px', minWidth: 180 }}
        />
        <select value={gallery} onChange={e => setGallery(e.target.value)} style={selectStyle}>
          {ALL_GALLERIES.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
          {ALL_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
          {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Title', 'Artist', 'Gallery', 'Type', 'Audio', 'AR score', 'Status', ''].map(h => (
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
          {filtered.map(a => {
            const s = STATUS_STYLES[a.status] || STATUS_STYLES.active;
            return (
              <tr
                key={a.id}
                onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'rgba(20,184,96,0.02)')}
                onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}
              >
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{a.title}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#555', fontFamily: "'Outfit', sans-serif" }}>{a.artist}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#888', fontFamily: "'Outfit', sans-serif", maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.gallery}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', color: '#888', fontFamily: "'Outfit', sans-serif" }}>{a.type}</td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 14 }}>{a.hasAudio ? '🔊' : '—'}</span>
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <ARScoreBar score={a.arScore} />
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <StatusBadge label={s.label} dir={s.dir} size={10} />
                </td>
                <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                  <button style={{
                    padding: '3px 10px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.1)',
                    background: 'transparent', color: '#888', fontSize: 11,
                    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  }}>
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
          No artworks match your filters.
        </div>
      )}
    </PageShell>
  );
}
