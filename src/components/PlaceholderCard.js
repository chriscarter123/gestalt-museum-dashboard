import React from 'react';

// ── PlaceholderCard ─────────────────────────────────────────────────────────
// For chart-sized areas where data requires an external system.

export function PlaceholderCard({ icon = '📊', systemName, description }) {
  return (
    <div style={{
      background: '#F9FAFB',
      border: '1px dashed rgba(0,0,0,0.08)',
      borderRadius: 10,
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: 140,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <span style={{ fontSize: 24, marginBottom: 10, opacity: 0.5 }}>{icon}</span>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>
        Connect {systemName} to see real data
      </div>
      {description && (
        <div style={{ fontSize: 11, color: '#D1D5DB', maxWidth: 280 }}>
          {description}
        </div>
      )}
    </div>
  );
}

// ── PlaceholderMetricCard ───────────────────────────────────────────────────
// Same dimensions as MetricCard for grid compatibility.

export function PlaceholderMetricCard({ label, systemName }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 10,
      padding: '16px 16px 14px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Muted top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: '#E5E7EB',
      }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#D1D5DB', fontFamily: "'Newsreader', serif", lineHeight: 1, marginBottom: 6 }}>
        —
      </div>
      <div style={{ fontSize: 11, color: '#D1D5DB' }}>
        Requires {systemName}
      </div>
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────────────────────────
// Shown when artworks array is empty.

export function EmptyPageState({ pageName }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', textAlign: 'center', fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>🖼</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
        No artworks yet
      </div>
      <div style={{ fontSize: 13, color: '#9CA3AF', maxWidth: 320 }}>
        Add artworks to see your {pageName}. Head to the Artworks page to get started.
      </div>
    </div>
  );
}

// ── LoadingSkeleton ─────────────────────────────────────────────────────────
// Pulsing skeleton for metric card grid.

export function LoadingSkeleton() {
  const pulse = {
    background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 8,
  };
  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ ...pulse, height: 100 }} />
        ))}
      </div>
      <div style={{ ...pulse, height: 300 }} />
    </>
  );
}
