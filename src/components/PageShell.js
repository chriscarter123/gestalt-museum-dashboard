import React from 'react';

export default function PageShell({ title, subtitle, actionLabel, onAction, children }) {
  return (
    <div style={{
      flex: 1, padding: '24px 28px', overflowY: 'auto', background: '#FCFCFC',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 24,
      }}>
        <div>
          <div style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 24, fontWeight: 600, color: '#111827',
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 13, color: '#888', marginTop: 2, fontFamily: "'Outfit', sans-serif" }}>
              {subtitle}
            </div>
          )}
        </div>
        {actionLabel && (
          <button
            onClick={onAction}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 6,
              border: '1px solid rgba(20,184,96,0.3)',
              background: 'rgba(20,184,96,0.04)', color: '#14B860',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,96,0.1)'; e.currentTarget.style.borderColor = '#14B860'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,96,0.04)'; e.currentTarget.style.borderColor = 'rgba(20,184,96,0.3)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M4 12v2h8v-2"/><path d="M8 2v8"/><path d="M5 7l3 3 3-3"/>
            </svg>
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
