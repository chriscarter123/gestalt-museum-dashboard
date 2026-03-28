import React from 'react';

const NAV = [
  {
    section: null,
    items: [
      {
        id: 'gallery-home', label: 'My Gallery',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"/><rect x="6" y="9" width="4" height="6" rx="0.5"/></svg>,
      },
    ],
  },
  {
    section: 'Content',
    items: [
      {
        id: 'artworks', label: 'Artworks',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="6" cy="7" r="1.5"/><polyline points="14 13 10 9 7 12"/></svg>,
      },
      {
        id: 'qr-sharing', label: 'QR & Sharing',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="2" width="5" height="5" rx="0.5"/><rect x="9" y="2" width="5" height="5" rx="0.5"/><rect x="2" y="9" width="5" height="5" rx="0.5"/><rect x="3.5" y="3.5" width="2" height="2" fill="currentColor" stroke="none"/><rect x="10.5" y="3.5" width="2" height="2" fill="currentColor" stroke="none"/><rect x="3.5" y="10.5" width="2" height="2" fill="currentColor" stroke="none"/><line x1="10" y1="10" x2="10" y2="10"/><polyline points="10 10 14 10 14 14 10 14 10 12"/></svg>,
      },
    ],
  },
  {
    section: 'Insights',
    items: [
      {
        id: 'visitor-insights', label: 'Visitor Insights',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="2 12 5 6 8 9 11 4 14 8"/><line x1="2" y1="14" x2="14" y2="14"/></svg>,
      },
    ],
  },
  {
    section: 'Account',
    items: [
      {
        id: 'plan-billing', label: 'Plan & Billing',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><polygon points="8 2 10 6 14 6.5 11 9.5 11.8 14 8 12 4.2 14 5 9.5 2 6.5 6 6 8 2"/></svg>,
      },
    ],
  },
];

function tierLabel(venue) {
  if (venue.tier === 'starter') return 'Free Plan';
  if (venue.tier === 'gallery') return 'Gallery Plan';
  return 'Institution Plan';
}

function artworkUsageLabel(venue) {
  const limit = venue.plan?.artworkLimit;
  if (!limit) return 'Unlimited artworks';
  return `${venue.artworkCount} / ${limit} artworks`;
}

export default function GalleryLiteSidebar({ activePage, onNavigate, venue }) {
  const owner = venue?.owner || {};

  return (
    <div style={{
      width: 220, background: '#111827', display: 'flex',
      flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ width: 28, height: 28, position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', width: 12, height: 12, top: 0, left: 0, background: '#14B860', borderRadius: '3px 3px 12px 3px' }} />
          <div style={{ position: 'absolute', width: 12, height: 12, top: 0, right: 0, border: '1.5px solid #14B860', borderRadius: '3px 3px 3px 12px', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', width: 12, height: 12, bottom: 0, left: 0, border: '1.5px solid #14B860', borderRadius: '3px 12px 3px 3px', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', width: 12, height: 12, bottom: 0, right: 0, background: '#14B860', borderRadius: '12px 3px 3px 3px' }} />
        </div>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#fff', letterSpacing: '0.02em', fontFamily: "'Outfit', sans-serif" }}>
          gestalt
        </span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {NAV.map(({ section, items }, si) => (
          <div key={si}>
            {section && (
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '12px 20px 6px',
                fontWeight: 500, fontFamily: "'Outfit', sans-serif",
              }}>
                {section}
              </div>
            )}
            {items.map(({ id, label, icon }) => {
              const active = activePage === id;
              return (
                <div
                  key={id}
                  onClick={() => onNavigate(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 20px', fontSize: 13, cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    background: active ? 'rgba(20,184,96,0.08)' : 'transparent',
                    borderLeft: `2px solid ${active ? '#14B860' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  <div style={{ width: 16, height: 16, opacity: active ? 1 : 0.6, flexShrink: 0 }}>{icon}</div>
                  {label}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tier pill */}
      <div
        onClick={() => onNavigate('plan-billing')}
        style={{
          margin: '0 12px 12px', padding: '8px 12px',
          background: 'rgba(20,184,96,0.1)', border: '1px solid rgba(20,184,96,0.2)',
          borderRadius: 6, cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: '#14B860', fontFamily: "'Outfit', sans-serif" }}>
          {tierLabel(venue)}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(20,184,96,0.7)', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>
          {artworkUsageLabel(venue)}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#D4AF37',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, color: '#111827', flexShrink: 0,
          fontFamily: "'Outfit', sans-serif",
        }}>
          {owner.initials || '?'}
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: "'Outfit', sans-serif" }}>{owner.name || 'Gallery Owner'}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit', sans-serif" }}>{owner.role || 'Owner'}</div>
        </div>
      </div>
    </div>
  );
}
