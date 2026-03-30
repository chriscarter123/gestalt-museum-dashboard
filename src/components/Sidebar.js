import React from 'react';
import { institution } from '../data/mockData';

const NAV = [
  {
    section: 'Overview',
    sectionNum: '00',
    items: [
      {
        id: 'ada', label: 'ADA scorecard',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
      },
      {
        id: 'analytics', label: 'Visitor analytics',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="2 12 5 6 8 9 11 4 14 8"/><line x1="2" y1="14" x2="14" y2="14"/></svg>,
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
        id: 'audio', label: 'Audio descriptions',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="8" cy="7" r="3"/><path d="M5 7v2a3 3 0 006 0V7"/><line x1="8" y1="12" x2="8" y2="14"/><line x1="5" y1="14" x2="11" y2="14"/></svg>,
      },
      {
        id: 'anchors', label: 'AR anchors',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="8" cy="8" r="3"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="8" y1="11" x2="8" y2="14"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="11" y1="8" x2="14" y2="8"/></svg>,
      },
    ],
  },
  {
    section: 'Reports',
    sectionNum: '02',
    items: [
      {
        id: 'reports', label: 'Grant reports',
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 2h8l2 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="9" y2="11"/></svg>,
      },
    ],
  },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user } = institution;

  return (
    <div style={{
      width: 220, background: '#111827', display: 'flex',
      flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '22px 20px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ width: 26, height: 26, position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', width: 11, height: 11, top: 0, left: 0, background: '#14B860', borderRadius: '3px 3px 11px 3px' }} />
          <div style={{ position: 'absolute', width: 11, height: 11, top: 0, right: 0, border: '1.5px solid #14B860', borderRadius: '3px 3px 3px 11px', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', width: 11, height: 11, bottom: 0, left: 0, border: '1.5px solid #14B860', borderRadius: '3px 11px 3px 3px', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', width: 11, height: 11, bottom: 0, right: 0, background: '#14B860', borderRadius: '11px 3px 3px 3px' }} />
        </div>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#fff', letterSpacing: '0.02em', fontFamily: "'Outfit', sans-serif" }}>
          gestalt
        </span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '12px 0 8px', overflowY: 'auto' }}>
        {NAV.map(({ section, sectionNum, items }) => (
          <div key={section} style={{ marginBottom: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 7,
              padding: '14px 20px 5px',
            }}>
              <span style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 11, fontWeight: 400,
                color: 'rgba(255,255,255,0.18)',
                lineHeight: 1, letterSpacing: '0.02em', flexShrink: 0,
              }}>
                {sectionNum}
              </span>
              <div style={{
                width: 10, height: 1,
                background: 'rgba(255,255,255,0.08)',
                flexShrink: 0, alignSelf: 'center',
              }} />
              <span style={{
                fontSize: 9, fontWeight: 600,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                fontFamily: "'Outfit', sans-serif",
              }}>
                {section}
              </span>
            </div>
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

      {/* Tier badge — Edition Tag (dark + gold variant for Institution) */}
      <div style={{
        margin: '0 14px 14px',
        display: 'flex', alignItems: 'stretch',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3, overflow: 'hidden', height: 38, flexShrink: 0,
      }}>
        <div style={{
          width: 28, background: '#D4AF37',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#7a5c10',
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontFamily: "'Outfit', sans-serif",
          }}>
            Plan
          </span>
        </div>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 10px', gap: 1, background: 'rgba(255,255,255,0.03)',
        }}>
          <div style={{
            fontFamily: "'Newsreader', serif", fontSize: 13, fontWeight: 600,
            color: '#D4AF37', lineHeight: 1, letterSpacing: '0.01em',
          }}>
            Institution
          </div>
          <div style={{
            fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)', fontFamily: "'Outfit', sans-serif",
          }}>
            Unlimited
          </div>
        </div>
      </div>

      {/* Footer — owner */}
      <div style={{
        padding: '11px 16px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        {/* Archive-mark avatar */}
        <div style={{
          width: 28, height: 28,
          border: '1px solid rgba(212,175,55,0.5)',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, borderRadius: 2,
          background: 'rgba(212,175,55,0.06)',
        }}>
          <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: 1, background: 'rgba(212,175,55,0.3)' }} />
          <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, height: 1, background: 'rgba(212,175,55,0.3)' }} />
          <span style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 11, fontWeight: 600, color: '#D4AF37', letterSpacing: '0.02em',
          }}>
            {user.initials}
          </span>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Outfit', sans-serif", fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {user.name}
          </div>
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.25)',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1,
          }}>
            {user.role}
          </div>
        </div>
      </div>
    </div>
  );
}
