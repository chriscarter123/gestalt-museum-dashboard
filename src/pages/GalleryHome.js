import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';

// ── Add Location Modal ─────────────────────────────────────────────────────────
function AddLocationModal({ venue, onSave, onClose }) {
  const [address, setAddress] = useState(venue.address || '');
  const [radius, setRadius] = useState(venue.proximityRadiusMeters || 15);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 440,
        boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 400, color: '#111827', margin: 0 }}>
            Add your location
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif", margin: '0 0 24px' }}>
          Visitors nearby will see your venue on the Gestalt map and can discover your artworks.
        </p>

        <label style={LS.label}>Venue address</label>
        <input
          style={LS.input}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="e.g. 123 Main St, Philadelphia, PA 19103"
          autoFocus
        />

        <label style={LS.label}>Proximity radius</label>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>
              Visitors within <strong style={{ color: '#111827' }}>{radius}m</strong> of your venue will see it on the map
            </span>
          </div>
          <input
            type="range" min={5} max={100} step={5}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#14B860' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif" }}>5m (tight)</span>
            <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif" }}>100m (loose)</span>
          </div>
        </div>

        <div style={{ background: '#F4F6F3', borderRadius: 8, padding: '10px 14px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>
          <p style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif", margin: 0, lineHeight: 1.5 }}>
            Your exact coordinates will be set automatically from the address when the Firestore integration is live. For now this saves your address and radius to your venue profile.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', background: '#fff', color: '#374151',
            border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13,
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          }}>
            Cancel
          </button>
          <button
            onClick={() => onSave({ address, proximityRadiusMeters: radius })}
            disabled={!address.trim()}
            style={{
              padding: '9px 20px', background: '#111827', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: address.trim() ? 'pointer' : 'not-allowed',
              opacity: address.trim() ? 1 : 0.4,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Save location
          </button>
        </div>
      </div>
    </div>
  );
}

const LS = {
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13, border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif", outline: 'none', marginBottom: 16, boxSizing: 'border-box', color: '#111827', background: '#fff' },
};

const ACTIVITY = [
  { text: 'Audio description generated for Shore Sail Boat', time: '2 min ago' },
  { text: 'QR label printed for Shore Sail Boat', time: '5 min ago' },
  { text: 'Visitor scanned Shore Sail Boat via Gestalt app', time: '14 min ago' },
  { text: 'Artwork Harbor Fog added', time: '1 hour ago' },
  { text: 'Venue profile created', time: '2 hours ago' },
];

function scoreColor(score) {
  if (score >= 80) return '#14B860';
  if (score >= 40) return '#D4AF37';
  return '#E24B4A';
}

function HealthScoreCard({ venue, artworks }) {
  const artworkList = artworks || [];
  const audioCount = artworkList.filter(a => a.hasAudio).length;
  const audioTotal = artworkList.length || venue.artworkCount || 0;
  // Accessibility score: weighted from audio coverage (60%), active artworks (20%), having any artworks (20%)
  const audioPctRaw = audioTotal > 0 ? (audioCount / audioTotal) * 100 : 0;
  const hasArtworks = artworkList.length > 0 ? 20 : 0;
  const activeRatio = audioTotal > 0 ? (artworkList.filter(a => a.status === 'active').length / audioTotal) * 20 : 0;
  const score = Math.round(audioPctRaw * 0.6 + activeRatio + hasArtworks);
  const audioPct = audioTotal > 0 ? Math.round((audioCount / audioTotal) * 100) : 0;
  const audioColor = audioPct >= 80 ? '#14B860' : audioPct >= 40 ? '#D4AF37' : '#E24B4A';

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24, marginBottom: 20, display: 'flex', gap: 32 }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: scoreColor(score), fontFamily: "'Newsreader', serif", lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginTop: 6, marginBottom: 12 }}>Accessibility score</div>
        <div style={{ width: 120, height: 4, background: '#E5E7EB', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${score}%`, background: scoreColor(score), borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 10 }}>out of 100</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: audioColor, fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>
          🔊 {audioCount} of {audioTotal} artworks have audio descriptions
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>
          📍 QR labels printed for 2 artworks
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>
          ♿ Wheelchair access: Yes
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>
          Add audio to {audioTotal - audioCount} more artworks to reach a score of 77.
        </div>
      </div>
    </div>
  );
}

function SetupChecklist({ venue, onNavigate, onAddLocation }) {
  const hasArtwork = (venue.artworkCount || 0) > 0;
  const hasLocation = !!(venue.address && venue.address.trim());
  const items = [
    { done: true,        label: 'Set up your venue profile',         sub: 'Name, type, and floor count saved',               cta: null },
    { done: hasArtwork,  label: 'Add your first artwork',            sub: 'Upload a photo and generate an audio description', cta: { label: 'Add artwork →', action: () => onNavigate('artworks') } },
    { done: false,       label: 'Print a QR label',                  sub: 'Put it on the wall so visitors can scan',          cta: { label: 'Print label →', action: () => onNavigate('qr-sharing') } },
    { done: false,       label: 'Preview in the visitor app',        sub: 'See exactly what your visitors experience',        cta: { label: 'Open preview →', action: () => window.open('https://gestalt-17ce0.web.app/app', '_blank') } },
    { done: hasLocation, label: 'Add your venue to the Gestalt map', sub: hasLocation ? venue.address : 'Let visitors discover you nearby', cta: hasLocation ? null : { label: 'Add location →', action: onAddLocation } },
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Getting started</div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid #F3F4F6' : 'none',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
              background: item.done ? '#14B860' : '#fff',
              border: item.done ? 'none' : '2px solid #D1D5DB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.done && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
            </div>
            <div>
              <div style={{
                fontSize: 13, color: item.done ? '#9CA3AF' : '#111827',
                fontFamily: "'Outfit', sans-serif",
                textDecoration: item.done ? 'line-through' : 'none',
              }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{item.sub}</div>
            </div>
          </div>
          {item.cta && !item.done && (
            <button onClick={item.cta.action} style={{
              background: 'none', border: 'none', color: '#14B860', fontSize: 12,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {item.cta.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function ExhibitionsCard({ venue, exhibitions, onNewExhibition }) {
  const isLocked = venue.tier === 'starter';

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>Exhibitions</div>
        {!isLocked && (
          <button onClick={onNewExhibition} style={{
            fontSize: 12, color: '#14B860', background: 'none', border: '1px solid #14B860',
            borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          }}>
            + New Exhibition
          </button>
        )}
      </div>

      {isLocked ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>
            Unlock with Gallery plan
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>
            Group artworks into time-bounded exhibitions. Available on Gallery plan and above.
          </div>
          <button style={{
            padding: '7px 16px', background: '#111827', color: '#fff', border: 'none',
            borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          }}>
            Upgrade to Gallery — $99/mo
          </button>
        </div>
      ) : (
        exhibitions.length === 0 ? (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", textAlign: 'center', padding: '16px 0' }}>
            No exhibitions yet. Create your first one.
          </div>
        ) : (
          exhibitions.map(exh => (
            <div key={exh.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #F3F4F6',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{exh.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>
                  {exh.startDate} – {exh.endDate} · {exh.artworkIds.length} artworks
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusBadge label={exh.status.charAt(0).toUpperCase() + exh.status.slice(1)} dir={exh.status} />
                <button style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Edit</button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}

function RecentActivity() {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Recent</div>
      {ACTIVITY.map((item, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid #F3F4F6' : 'none',
          gap: 16,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#14B860', flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 12, color: '#374151', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{item.text}</span>
          </div>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>{item.time}</span>
        </div>
      ))}
    </div>
  );
}

export default function GalleryHome({ venue, artworks, exhibitions, onNavigate, onNewExhibition, onVenueUpdate }) {
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  function handleSaveLocation(data) {
    if (onVenueUpdate) onVenueUpdate(data);
    setLocationModalOpen(false);
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: '#FCFCFC',
      padding: '28px 32px 32px', fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Header — editorial style */}
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
            Overview
          </div>
          <h1 style={{
            fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 300,
            color: '#111827', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            My Gallery
          </h1>
          <div style={{ fontSize: 13, color: 'rgba(17,24,39,0.4)', marginTop: 5, fontFamily: "'Outfit', sans-serif" }}>
            {venue.name || 'Your venue'} · Last updated 2 minutes ago
          </div>
        </div>
        <button
          onClick={() => onNavigate('artworks')}
          style={{
            padding: '8px 16px', background: 'transparent', color: '#111827',
            border: '1px solid #111827', borderRadius: 2,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111827'; }}
        >
          + Add Artwork
        </button>
      </div>

      <HealthScoreCard venue={venue} artworks={artworks} />
      <SetupChecklist venue={venue} onNavigate={onNavigate} onAddLocation={() => setLocationModalOpen(true)} />
      <ExhibitionsCard venue={venue} exhibitions={exhibitions} onNewExhibition={onNewExhibition} />
      <RecentActivity />

      {locationModalOpen && (
        <AddLocationModal
          venue={venue}
          onSave={handleSaveLocation}
          onClose={() => setLocationModalOpen(false)}
        />
      )}
    </div>
  );
}
