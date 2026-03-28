import React, { useState, useRef } from 'react';
import StatusBadge from '../components/StatusBadge';
import PageShell from '../components/PageShell';
import { institution, artworksList as defaultArtworksList } from '../data/mockData';

const STATUS_STYLES = {
  active:       { label: 'Active',       dir: 'up' },
  unverified:   { label: 'Unverified',   dir: 'flat' },
  deteriorating:{ label: 'Deteriorating',dir: 'down' },
  removed:      { label: 'Removed',      dir: 'down' },
};

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

// ── Add Artwork Drawer ─────────────────────────────────────────────────────────
function AddArtworkDrawer({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', artist: '', year: '', medium: '', condition: 'Good', location: '', photoPreview: null });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, photoPreview: url }));
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1500);
  }

  function handleSubmit() {
    if (!form.title.trim()) return;
    onSave({
      id: `ART-NEW-${Date.now()}`,
      title: form.title.trim(),
      artist: form.artist.trim() || 'Unknown',
      gallery: form.location.trim() || 'Main Gallery',
      type: form.medium.trim() || 'Artwork',
      hasAudio: generated,
      arScore: 0.5,
      status: 'active',
    });
  }

  const descText = form.title
    ? `${form.title} by ${form.artist || 'Unknown'}, ${form.year || 'date unknown'}. A captivating work that draws the viewer into its composition through deliberate use of form and color.`
    : null;

  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, height: '100%', width: 420,
      background: '#fff', borderLeft: '1px solid #E5E7EB', zIndex: 100,
      display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
    }}>
      {/* Drawer header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>Add Artwork</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
      </div>

      {/* Drawer body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Photo upload */}
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: '2px dashed #E5E7EB', borderRadius: 8, padding: 20,
            textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: '#F9FAFB',
          }}
        >
          {form.photoPreview ? (
            <img src={form.photoPreview} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 4 }} />
          ) : (
            <>
              <div style={{ fontSize: 22, marginBottom: 6 }}>🖼</div>
              <div style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>
                Drag & drop, or <span style={{ color: '#14B860', fontWeight: 500 }}>choose file</span>
              </div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>

        {generating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F4F6F3', borderRadius: 8, marginBottom: 16 }}>
            <div style={spinnerStyle} />
            <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>Generating audio description…</span>
          </div>
        )}

        {generated && descText && (
          <div style={{ background: '#E8F7EF', borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#0D7A3E', fontFamily: "'Outfit', sans-serif", marginBottom: 10, lineHeight: 1.5 }}>{descText}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setPlaying(p => !p)} style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                background: '#14B860', cursor: 'pointer', color: '#fff', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {playing ? '⏸' : '▶'}
              </button>
              <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-end', height: 20 }}>
                {[5,8,12,7,14,10,8,12,7,5,10,8,14,7,10,12,8,5,12,10].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: h, background: playing ? '#14B860' : '#A7D9BC', borderRadius: 2 }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <label style={S.label}>Title <span style={{ color: '#E24B4A' }}>*</span></label>
        <input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Artwork title" />

        <label style={S.label}>Artist</label>
        <input style={S.input} value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} placeholder="Artist name" />

        <label style={S.label}>Year</label>
        <input style={S.input} value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="Year created" />

        <label style={S.label}>Medium</label>
        <input style={S.input} value={form.medium} onChange={e => setForm(f => ({ ...f, medium: e.target.value }))} placeholder="e.g. Oil on canvas, Photography, Sculpture" />

        <label style={S.label}>Condition</label>
        <select style={S.input} value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
          {['Excellent', 'Good', 'Fair', 'Poor'].map(c => <option key={c}>{c}</option>)}
        </select>

        <label style={S.label}>Location in venue</label>
        <input style={{ ...S.input, marginBottom: 0 }} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. East Wall, Room 3" />
      </div>

      {/* Drawer footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6' }}>
        <button
          onClick={handleSubmit}
          disabled={!form.title.trim()}
          style={{
            width: '100%', padding: '10px 0', background: '#111827', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: form.title.trim() ? 'pointer' : 'not-allowed',
            opacity: form.title.trim() ? 1 : 0.4,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Save Artwork
        </button>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 0', textAlign: 'center',
    }}>
      <svg width={72} height={72} viewBox="0 0 72 72" fill="none" style={{ marginBottom: 20, opacity: 0.3 }}>
        <rect x="8" y="8" width="56" height="56" rx="4" stroke="#374151" strokeWidth="3"/>
        <rect x="16" y="16" width="40" height="40" rx="2" stroke="#374151" strokeWidth="2"/>
        <circle cx="28" cy="30" r="5" stroke="#374151" strokeWidth="2"/>
        <polyline points="52 56 38 40 28 48" stroke="#374151" strokeWidth="2"/>
      </svg>
      <div style={{ fontSize: 18, fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>No artworks yet</div>
      <div style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginBottom: 24, maxWidth: 320 }}>
        Add your first artwork to generate an audio description and QR label.
      </div>
      <button onClick={onAdd} style={{
        padding: '10px 24px', background: '#111827', color: '#fff', border: 'none',
        borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
      }}>
        + Add your first artwork
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Artworks({ venue, artworks: externalArtworks, onArtworkAdded }) {
  const [search, setSearch]   = useState('');
  const [gallery, setGallery] = useState('All galleries');
  const [type, setType]       = useState('All types');
  const [status, setStatus]   = useState('All statuses');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Use external artworks if provided (Gallery Lite mode), else use default mock list
  const isLiteMode = !!venue;
  const artworksList = isLiteMode ? (externalArtworks || []) : defaultArtworksList;

  const isAtLimit = isLiteMode && venue?.tier === 'starter' && artworksList.length >= (venue?.plan?.artworkLimit || 5);

  const filtered = artworksList.filter(a => {
    const matchSearch  = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.artist.toLowerCase().includes(search.toLowerCase());
    const matchGallery = gallery === 'All galleries' || a.gallery === gallery;
    const matchType    = type === 'All types' || a.type === type;
    const matchStatus  = status === 'All statuses' || a.status === status;
    return matchSearch && matchGallery && matchType && matchStatus;
  });

  const dynamicGalleries = ['All galleries', ...new Set(artworksList.map(a => a.gallery))];
  const dynamicTypes     = ['All types',     ...new Set(artworksList.map(a => a.type))];

  const selectStyle = {
    padding: '6px 10px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)',
    fontSize: 12, color: '#333', background: '#fff', cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif", outline: 'none',
  };

  function handleSaveArtwork(artwork) {
    if (onArtworkAdded) onArtworkAdded(artwork);
    setDrawerOpen(false);
  }

  return (
    <PageShell
      title="Artworks"
      subtitle={isLiteMode ? `${venue?.name || 'Your gallery'} · ${artworksList.length} artworks` : `${institution.name} · ${defaultArtworksList.length} artworks`}
      actionLabel={isAtLimit ? null : "+ Add artwork"}
      onAction={isAtLimit ? null : () => setDrawerOpen(true)}
    >
      <div style={{ position: 'relative' }}>
        {/* Tier limit banner */}
        {isAtLimit && (
          <div style={{
            background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 8,
            padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 13, color: '#92400E', fontFamily: "'Outfit', sans-serif" }}>
              You've reached your 5-artwork limit on the Free plan. Upgrade to Gallery to add up to 50 artworks.
            </div>
            <button style={{
              padding: '6px 14px', background: '#111827', color: '#fff', border: 'none',
              borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", flexShrink: 0, marginLeft: 16,
            }}>
              Upgrade
            </button>
          </div>
        )}

        {artworksList.length === 0 ? (
          <EmptyState onAdd={() => setDrawerOpen(true)} />
        ) : (
          <>
            {/* Summary strip */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, padding: '12px 16px', background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.06)' }}>
              {[
                { label: 'Total', value: artworksList.length, color: '#111827' },
                { label: 'With audio', value: artworksList.filter(a => a.hasAudio).length, color: '#14B860' },
                { label: 'Missing audio', value: artworksList.filter(a => !a.hasAudio).length, color: '#E24B4A' },
                { label: 'Avg AR score', value: artworksList.length > 0 ? (artworksList.reduce((s, a) => s + (a.arScore || 0), 0) / artworksList.length).toFixed(2) : '—', color: '#D4AF37' },
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
                {dynamicGalleries.map(g => <option key={g}>{g}</option>)}
              </select>
              <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                {dynamicTypes.map(t => <option key={t}>{t}</option>)}
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
                        {a.arScore != null ? <ARScoreBar score={a.arScore} /> : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                        <StatusBadge label={s.label} dir={s.dir} size={10} />
                      </td>
                      <td style={{ padding: '9px 10px', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                        <button style={{
                          padding: '3px 10px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.1)',
                          background: 'transparent', color: '#888', fontSize: 11,
                          cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                        }}>Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && artworksList.length > 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                No artworks match your filters.
              </div>
            )}
          </>
        )}

        {/* Add Artwork Drawer */}
        {drawerOpen && (
          <AddArtworkDrawer
            onClose={() => setDrawerOpen(false)}
            onSave={handleSaveArtwork}
          />
        )}
      </div>
    </PageShell>
  );
}

const S = {
  label: {
    display: 'block', fontSize: 12, fontWeight: 500, color: '#374151',
    fontFamily: "'Outfit', sans-serif", marginBottom: 6,
  },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13,
    border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
    outline: 'none', marginBottom: 14, boxSizing: 'border-box', color: '#111827', background: '#fff',
  },
};

const spinnerStyle = {
  width: 14, height: 14, borderRadius: '50%',
  border: '2px solid #E5E7EB', borderTopColor: '#14B860',
  animation: 'spin 0.7s linear infinite', flexShrink: 0,
};
