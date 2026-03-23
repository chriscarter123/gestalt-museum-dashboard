import React from 'react';
import { institution } from '../data/mockData';

const NAV = [
  {
    section: 'Overview',
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
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div style={{
              fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '12px 20px 6px',
              fontWeight: 500, fontFamily: "'Outfit', sans-serif",
            }}>
              {section}
            </div>
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
          {user.initials}
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: "'Outfit', sans-serif" }}>{user.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit', sans-serif" }}>{user.role}</div>
        </div>
      </div>
    </div>
  );
}
