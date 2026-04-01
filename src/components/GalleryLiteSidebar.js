import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import GestaltLogo from './GestaltLogo';

// Section numbers map to nav group order
const NAV = [
  {
    section: null,
    sectionNum: null,
    items: [
      {
        id: 'gallery-home', label: 'My Gallery',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"/><rect x="6" y="9" width="4" height="6" rx="0.5"/></svg>,
      },
    ],
  },
  {
    section: 'Content',
    sectionNum: '01',
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
    sectionNum: '02',
    items: [
      {
        id: 'visitor-insights', label: 'Visitor Insights',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="2 12 5 6 8 9 11 4 14 8"/><line x1="2" y1="14" x2="14" y2="14"/></svg>,
      },
    ],
  },
  {
    section: 'Account',
    sectionNum: '03',
    items: [
      {
        id: 'plan-billing', label: 'Plan & Billing',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><polygon points="8 2 10 6 14 6.5 11 9.5 11.8 14 8 12 4.2 14 5 9.5 2 6.5 6 6 8 2"/></svg>,
      },
    ],
  },
];

function tierLabel(venue) {
  if (venue.tier === 'starter') return 'Free';
  if (venue.tier === 'gallery') return 'Gallery';
  return 'Institution';
}

function artworkUsageLabel(venue) {
  const limit = venue.plan?.artworkLimit;
  if (!limit) return 'Unlimited';
  return `${venue.artworkCount || 0} / ${limit} works`;
}

// Edition Tag (dark variant) — left color strip + serif plan name
function TierTag({ venue, onClick }) {
  const isGallery = venue.tier === 'gallery';
  const isInstitution = venue.tier === 'institution';
  const stripColor = isInstitution ? '#D4AF37' : isGallery ? '#14B860' : 'rgba(255,255,255,0.2)';

  return (
    <div
      onClick={onClick}
      style={{
        margin: '0 14px 14px',
        display: 'flex',
        alignItems: 'stretch',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        height: 38,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {/* Left color strip */}
      <div style={{
        width: 28,
        background: stripColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: isInstitution ? '#7a5c10' : '#fff',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontFamily: "'Outfit', sans-serif",
        }}>
          Plan
        </span>
      </div>
      {/* Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 10px',
        gap: 1,
        background: 'rgba(255,255,255,0.03)',
      }}>
        <div style={{
          fontFamily: "'Newsreader', serif",
          fontSize: 13,
          fontWeight: 600,
          color: isInstitution ? '#D4AF37' : isGallery ? '#14B860' : 'rgba(255,255,255,0.5)',
          lineHeight: 1,
          letterSpacing: '0.01em',
        }}>
          {tierLabel(venue)}
        </div>
        <div style={{
          fontSize: 8,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
          fontFamily: "'Outfit', sans-serif",
        }}>
          {artworkUsageLabel(venue)}
        </div>
      </div>
    </div>
  );
}

export default function GalleryLiteSidebar({ activePage, onNavigate, venue, userVenues = [], currentVenueId, onSwitchVenue, userProfile }) {
  const owner = userProfile || venue?.owner || {};

  return (
    <div style={{
      width: 220, background: '#111827', display: 'flex',
      flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <GestaltLogo height={26} variant="light" />
      </div>

      {/* Venue switcher */}
      {userVenues.length > 1 && (
        <div style={{ padding: '10px 16px 6px' }}>
          <select
            value={currentVenueId || ''}
            onChange={e => onSwitchVenue?.(e.target.value)}
            style={{
              width: '100%', padding: '6px 8px', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: 11,
              fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
              outline: 'none',
            }}
          >
            {userVenues.map(v => (
              <option key={v.id} value={v.id} style={{ background: '#111827' }}>{v.name || 'Unnamed venue'}</option>
            ))}
          </select>
        </div>
      )}

      {/* Nav */}
      <div style={{ flex: 1, padding: '12px 0 8px', overflowY: 'auto' }}>
        {NAV.map(({ section, sectionNum, items }, si) => (
          <div key={si} style={{ marginBottom: section ? 4 : 0 }}>
            {section && (
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 7,
                padding: '14px 20px 5px',
              }}>
                {/* Serif section number */}
                <span style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 11,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.18)',
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  flexShrink: 0,
                }}>
                  {sectionNum}
                </span>
                {/* Rule */}
                <div style={{
                  width: 10, height: 1,
                  background: 'rgba(255,255,255,0.08)',
                  flexShrink: 0,
                  alignSelf: 'center',
                }} />
                {/* Section name */}
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.25)',
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {section}
                </span>
              </div>
            )}
            {items.map(({ id, label, icon }) => {
              const active = activePage === id;
              return (
                <div
                  key={id}
                  onClick={() => onNavigate(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 20px', fontSize: 13, cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                    background: active ? 'rgba(20,184,96,0.07)' : 'transparent',
                    borderLeft: `2px solid ${active ? '#14B860' : 'transparent'}`,
                    transition: 'all 0.15s',
                    fontWeight: active ? 500 : 400,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  <div style={{ width: 15, height: 15, opacity: active ? 1 : 0.5, flexShrink: 0 }}>{icon}</div>
                  {label}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tier tag — Edition Tag style */}
      <TierTag venue={venue} onClick={() => onNavigate('plan-billing')} />

      {/* Footer — owner */}
      <div style={{
        padding: '11px 16px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        {/* Archive-mark style avatar */}
        <div style={{
          width: 28, height: 28,
          border: '1px solid rgba(212,175,55,0.5)',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          borderRadius: 2,
          background: 'rgba(212,175,55,0.06)',
        }}>
          {/* top + bottom inner rules */}
          <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: 1, background: 'rgba(212,175,55,0.3)' }} />
          <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, height: 1, background: 'rgba(212,175,55,0.3)' }} />
          <span style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 11, fontWeight: 600,
            color: '#D4AF37',
            letterSpacing: '0.02em',
          }}>
            {owner.initials || '?'}
          </span>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {owner.name || 'Gallery Owner'}
          </div>
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.25)',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: 1,
          }}>
            {owner.role || owner.position || 'Owner'}
          </div>
        </div>
        <button
          onClick={() => signOut(auth).then(() => window.location.reload())}
          title="Sign out"
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 14,
            padding: 4, flexShrink: 0, lineHeight: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
        >
          ↗
        </button>
      </div>
    </div>
  );
}
