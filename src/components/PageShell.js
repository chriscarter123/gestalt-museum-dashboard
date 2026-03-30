import React from 'react';

// Editorial page shell — tracking eyebrow + weight-300 serif heading + thin rule
export default function PageShell({ eyebrow, title, subtitle, actionLabel, onAction, children }) {
  return (
    <div style={{
      flex: 1, padding: '28px 32px 32px', overflowY: 'auto', background: '#FCFCFC',
    }}>
      {/* Header block */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', paddingBottom: 16,
          borderBottom: '1px solid rgba(17,24,39,0.07)',
        }}>
          <div>
            {/* Tracking eyebrow label */}
            {eyebrow && (
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(17,24,39,0.35)',
                fontFamily: "'Outfit', sans-serif",
                marginBottom: 8,
              }}>
                {eyebrow}
              </div>
            )}
            {/* Light serif heading */}
            <h1 style={{
              fontFamily: "'Newsreader', serif",
              fontSize: 26,
              fontWeight: 300,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              {title}
            </h1>
            {subtitle && (
              <div style={{
                fontSize: 13,
                color: 'rgba(17,24,39,0.4)',
                marginTop: 5,
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.5,
              }}>
                {subtitle}
              </div>
            )}
          </div>

          {/* Action button — editorial outlined style */}
          {actionLabel && (
            <button
              onClick={onAction}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px',
                border: '1px solid #111827',
                background: 'transparent',
                color: '#111827',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                borderRadius: 2,
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111827'; }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
