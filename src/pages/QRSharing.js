import React, { useState } from 'react';
import GestaltLogo from '../components/GestaltLogo';

// A deterministic fake QR grid pattern using a fixed seed
const QR_PATTERN = [
  [1,1,1,1,1,1,1,0,1,0],
  [1,0,0,0,0,0,1,0,0,1],
  [1,0,1,1,1,0,1,0,1,0],
  [1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,1,1,0,0],
  [1,1,1,1,1,1,1,0,1,0],
  [0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,0,1,1,0,1,0],
  [0,1,0,0,1,0,0,1,0,1],
];

function MockQR({ size = 120 }) {
  const cell = size / 10;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {QR_PATTERN.map((row, ri) =>
        row.map((cell_val, ci) =>
          cell_val ? (
            <rect key={`${ri}-${ci}`} x={ci * cell} y={ri * cell} width={cell} height={cell} fill="#111827" />
          ) : null
        )
      )}
    </svg>
  );
}

function FrameSVG({ label }) {
  return (
    <svg width={80} height={40} viewBox="0 0 80 40">
      <rect x="2" y="2" width="76" height="36" rx="3" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      {label === 'branded' && <rect x="2" y="2" width="76" height="36" rx="3" fill="#111827"/>}
      <rect x="8" y="8" width="16" height="16" rx="1" fill={label === 'branded' ? '#fff' : '#E5E7EB'}/>
      <rect x="30" y="10" width="30" height="4" rx="1" fill={label === 'branded' ? 'rgba(255,255,255,0.4)' : '#D1D5DB'}/>
      {(label === 'standard' || label === 'branded') && (
        <rect x="30" y="18" width="20" height="3" rx="1" fill={label === 'branded' ? 'rgba(255,255,255,0.2)' : '#E5E7EB'}/>
      )}
    </svg>
  );
}

const LABEL_TEMPLATES = [
  { key: 'minimal',  label: 'Minimal',  desc: 'QR + title only',                  locked: false },
  { key: 'standard', label: 'Standard', desc: 'QR + title + artist + year',        locked: false },
  { key: 'branded',  label: 'Branded',  desc: 'QR + title + Gestalt logo + venue', locked: true  },
];

const DEMO_ARTWORKS = [
  { id: 'ART-D1', title: 'Shore Sail Boat', artist: 'Elena Marsh', year: '2024' },
  { id: 'ART-D2', title: 'Harbor Fog',      artist: 'Kwame Asante', year: '2023' },
  { id: 'ART-D3', title: 'Untitled No. 3',  artist: 'Reyna Solís', year: '2025' },
];

export default function QRSharing({ venue, artworks }) {
  const artworkList = (artworks && artworks.length > 0) ? artworks : DEMO_ARTWORKS;
  const [selectedId, setSelectedId] = useState(artworkList[0]?.id || '');
  const [template, setTemplate] = useState('minimal');
  const [copied, setCopied] = useState(false);

  const selected = artworkList.find(a => a.id === selectedId) || artworkList[0];
  const galleryLink = 'gestalt-17ce0.web.app/app';

  function handleCopy() {
    navigator.clipboard.writeText(galleryLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#FCFCFC', padding: '28px 32px 32px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header — editorial */}
      <div style={{
        paddingBottom: 18, marginBottom: 24,
        borderBottom: '1px solid rgba(17,24,39,0.07)',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(17,24,39,0.35)',
          fontFamily: "'Outfit', sans-serif", marginBottom: 8,
        }}>
          Content
        </div>
        <h1 style={{
          fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 300,
          color: '#111827', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          QR & Sharing
        </h1>
        <div style={{ fontSize: 13, color: 'rgba(17,24,39,0.4)', marginTop: 5, fontFamily: "'Outfit', sans-serif" }}>
          Print labels · Share your gallery</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Section 1 — QR Labels */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Print QR labels</div>

          <label style={S.label}>Select artwork</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ ...S.input, marginBottom: 20 }}
          >
            {artworkList.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>

          {/* QR preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', marginBottom: 16 }}>
            <div style={{ padding: 12, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, marginBottom: 10 }}>
              <MockQR size={120} />
            </div>
            {selected && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{selected.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>{selected.artist}</div>
              </>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => window.print()} style={{
                padding: '7px 16px', background: '#111827', color: '#fff', border: 'none',
                borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              }}>
                Print label
              </button>
              <button
                title="Coming soon"
                style={{
                  padding: '7px 16px', background: '#fff', color: '#9CA3AF',
                  border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12,
                  cursor: 'not-allowed', fontFamily: "'Outfit', sans-serif",
                }}
              >
                Download PNG
              </button>
            </div>
          </div>

          {/* Label templates */}
          <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Label template</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {LABEL_TEMPLATES.map(t => {
              const isLocked = t.locked && venue?.tier === 'starter';
              const isSelected = template === t.key && !isLocked;
              return (
                <div
                  key={t.key}
                  onClick={() => { if (!isLocked) setTemplate(t.key); }}
                  style={{
                    flex: 1, border: `1.5px solid ${isSelected ? '#14B860' : '#E5E7EB'}`,
                    borderRadius: 8, padding: '10px 8px', cursor: isLocked ? 'not-allowed' : 'pointer',
                    textAlign: 'center', background: isSelected ? '#E8F7EF' : '#fff',
                    opacity: isLocked ? 0.6 : 1,
                  }}
                >
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                    <FrameSVG label={t.key} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>
                    {t.label} {isLocked && '🔒'}
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{t.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 2 — Phone frame preview */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Preview as a visitor</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{
                width: 180, borderRadius: 28, border: '3px solid #111827',
                background: '#111827', position: 'relative', overflow: 'hidden', padding: '28px 8px 16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}>
                {/* Notch */}
                <div style={{
                  position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                  width: 60, height: 10, background: '#111827', borderRadius: 5,
                  border: '1.5px solid rgba(255,255,255,0.1)',
                }} />
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, position: 'relative' }}>
                      <div style={{ position: 'absolute', width: 4, height: 4, top: 0, left: 0, background: '#14B860', borderRadius: '1px 1px 4px 1px' }} />
                      <div style={{ position: 'absolute', width: 4, height: 4, top: 0, right: 0, border: '0.8px solid #14B860', borderRadius: '1px 1px 1px 4px', boxSizing: 'border-box' }} />
                      <div style={{ position: 'absolute', width: 4, height: 4, bottom: 0, left: 0, border: '0.8px solid #14B860', borderRadius: '1px 4px 1px 1px', boxSizing: 'border-box' }} />
                      <div style={{ position: 'absolute', width: 4, height: 4, bottom: 0, right: 0, background: '#14B860', borderRadius: '4px 1px 1px 1px' }} />
                    </div>
                    <span style={{ fontSize: 8, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>gestalt</span>
                  </div>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif" }}>{galleryLink}</span>
                </div>
                {/* Viewfinder */}
                <div style={{
                  background: '#1F2937', borderRadius: 6, height: 100, position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  {/* Corner brackets */}
                  {[{ top: 6, left: 6 }, { top: 6, right: 6 }, { bottom: 6, left: 6 }, { bottom: 6, right: 6 }].map((pos, i) => (
                    <div key={i} style={{
                      position: 'absolute', width: 12, height: 12,
                      borderTop: pos.top !== undefined ? '2px solid rgba(255,255,255,0.6)' : 'none',
                      borderBottom: pos.bottom !== undefined ? '2px solid rgba(255,255,255,0.6)' : 'none',
                      borderLeft: pos.left !== undefined ? '2px solid rgba(255,255,255,0.6)' : 'none',
                      borderRight: pos.right !== undefined ? '2px solid rgba(255,255,255,0.6)' : 'none',
                      ...pos,
                    }} />
                  ))}
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit', sans-serif" }}>Camera viewfinder</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 9, color: '#14B860', fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginBottom: 8 }}>
                  Artwork Detected
                </div>
                {/* Bottom card */}
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                    {selected?.title || 'Shore Sail Boat'}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>
                    {selected?.artist || 'Elena Marsh'}
                  </div>
                  <div style={{
                    background: '#14B860', color: '#fff', fontSize: 8, fontWeight: 600,
                    textAlign: 'center', borderRadius: 4, padding: '4px 0',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    ▶ Play Audio
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <a
                href={`https://${galleryLink}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#14B860', fontFamily: "'Outfit', sans-serif" }}
              >
                Open in browser →
              </a>
            </div>
          </div>

          {/* Section 3 — Share */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Share</div>

            <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Gallery link</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                readOnly
                value={galleryLink}
                style={{ ...S.input, flex: 1, margin: 0, background: '#F9FAFB', color: '#6B7280' }}
              />
              <button onClick={handleCopy} style={{
                padding: '8px 14px', background: copied ? '#14B860' : '#111827', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Social card</div>
            <div style={{
              width: 280, height: 280, background: '#111827', borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', margin: '0 auto 12px',
            }}>
              {/* Gestalt logo mark */}
              <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
                <GestaltLogo height={20} iconOnly />
              </div>
              <div style={{
                fontSize: 22, fontWeight: 400, color: '#fff', fontFamily: "'Newsreader', serif",
                textAlign: 'center', padding: '0 24px', marginBottom: 8,
              }}>
                {venue?.name || 'Your Gallery'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif" }}>
                Discover art with Gestalt
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button
                title="Coming soon"
                style={{
                  padding: '7px 16px', background: '#fff', color: '#9CA3AF',
                  border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12,
                  cursor: 'not-allowed', fontFamily: "'Outfit', sans-serif",
                }}
              >
                Download card
              </button>
            </div>
          </div>
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
    width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 13,
    border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
    outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff',
  },
};
