import React, { useState } from 'react';

export default function ExhibitionModal({ artworks, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  function toggleArtwork(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({
      id: `exh_${Date.now()}`,
      name: name.trim(),
      startDate,
      endDate,
      status: 'active',
      artworkIds: selectedIds,
      description: description.trim(),
    });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 480,
        boxShadow: '0 12px 48px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 400, color: '#111827', margin: 0 }}>
            New Exhibition
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1,
          }}>×</button>
        </div>

        <label style={S.label}>Exhibition name <span style={{ color: '#E24B4A' }}>*</span></label>
        <input
          style={S.input}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Spring Acquisitions 2026"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={S.label}>Start date</label>
            <input type="date" style={S.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>End date</label>
            <input type="date" style={S.input} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <label style={S.label}>Description (optional)</label>
        <textarea
          style={{ ...S.input, height: 72, resize: 'vertical' }}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief description of this exhibition"
        />

        {artworks && artworks.length > 0 && (
          <>
            <label style={S.label}>Artworks</label>
            <div style={{
              border: '1.5px solid #E5E7EB', borderRadius: 6, maxHeight: 160, overflowY: 'auto',
              marginBottom: 24,
            }}>
              {artworks.map(a => (
                <label key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer', fontSize: 13, color: '#374151',
                }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(a.id)}
                    onChange={() => toggleArtwork(a.id)}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{a.title}</span>
                  {a.artist && <span style={{ color: '#9CA3AF', fontSize: 12 }}>· {a.artist}</span>}
                </label>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', background: '#fff', color: '#374151',
            border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13,
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              padding: '9px 20px', background: '#111827', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: name.trim() ? 1 : 0.4,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Create Exhibition
          </button>
        </div>
      </div>
    </div>
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
    outline: 'none', marginBottom: 16, boxSizing: 'border-box', color: '#111827', background: '#fff',
  },
};
