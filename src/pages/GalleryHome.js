import React from 'react';
import StatusBadge from '../components/StatusBadge';

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

function HealthScoreCard({ venue }) {
  const score = 44;
  const audioCount = 3;
  const audioTotal = venue.artworkCount || 5;
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

function SetupChecklist({ venue, onNavigate }) {
  const hasArtwork = (venue.artworkCount || 0) > 0;
  const items = [
    { done: true,       label: 'Set up your venue profile',          sub: 'Name, type, and floor count saved',                        cta: null },
    { done: hasArtwork, label: 'Add your first artwork',             sub: 'Upload a photo and generate an audio description',         cta: { label: 'Add artwork →', action: () => onNavigate('artworks') } },
    { done: false,      label: 'Print a QR label',                   sub: 'Put it on the wall so visitors can scan',                   cta: { label: 'Print label →', action: () => onNavigate('qr-sharing') } },
    { done: false,      label: 'Preview in the visitor app',         sub: 'See exactly what your visitors experience',                 cta: { label: 'Open preview →', action: () => onNavigate('qr-sharing') } },
    { done: false,      label: 'Add your venue to the Gestalt map',  sub: 'Let visitors discover you nearby',                         cta: { label: 'Add location →', action: () => {} } },
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

export default function GalleryHome({ venue, exhibitions, onNavigate, onNewExhibition }) {
  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: '#F4F6F3',
      padding: 32, fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 28, fontWeight: 400, color: '#111827', margin: 0 }}>
            My Gallery
          </h1>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            {venue.name || 'Your venue'} · Last updated 2 minutes ago
          </div>
        </div>
        <button
          onClick={() => onNavigate('artworks')}
          style={{
            padding: '9px 18px', background: '#111827', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500,
          }}
        >
          + Add Artwork
        </button>
      </div>

      <HealthScoreCard venue={venue} />
      <SetupChecklist venue={venue} onNavigate={onNavigate} />
      <ExhibitionsCard venue={venue} exhibitions={exhibitions} onNewExhibition={onNewExhibition} />
      <RecentActivity />
    </div>
  );
}
