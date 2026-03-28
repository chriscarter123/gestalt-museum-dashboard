import React from 'react';

const PLANS = [
  {
    key: 'starter',
    name: 'Free',
    price: '$0 / month',
    features: ['5 artworks', 'QR codes + basic audio', 'Gestalt branding on visitor cards', 'No analytics'],
    artworkLimit: 5,
  },
  {
    key: 'gallery',
    name: 'Gallery',
    price: '$99 / month',
    features: ['50 artworks', 'Audio descriptions (AI-generated)', 'Basic visitor analytics', 'Exhibition mode', 'Custom branding'],
    artworkLimit: 50,
  },
  {
    key: 'institution',
    name: 'Institution',
    price: '$500–$3,000 / month',
    features: ['Unlimited artworks', 'Full ADA scorecard', 'AR anchor management', 'NEA grant report builder', 'Multi-user, multi-floor'],
    artworkLimit: null,
  },
];

function usagePct(count, limit) {
  if (!limit) return 100;
  return Math.min(Math.round((count / limit) * 100), 100);
}

export default function PlanBilling({ venue }) {
  const tier = venue?.tier || 'starter';
  const currentPlan = PLANS.find(p => p.key === tier) || PLANS[0];
  const isFree = tier === 'starter';
  const artworkCount = venue?.artworkCount || 0;
  const artworkLimit = currentPlan.artworkLimit;
  const pct = usagePct(artworkCount, artworkLimit);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F4F6F3', padding: 32, fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 28, fontWeight: 400, color: '#111827', margin: 0 }}>Plan & Billing</h1>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Manage your Gestalt subscription</div>
      </div>

      {/* Current plan card */}
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderLeft: '4px solid #14B860',
        borderRadius: 10, padding: 24, marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', fontFamily: "'Newsreader', serif" }}>{currentPlan.name} Plan</div>
            <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>
              {isFree ? 'No subscription — free forever' : 'Renews May 1, 2026'}
            </div>
          </div>
          <span style={{
            background: '#E8F7EF', color: '#0D7A3E', fontSize: 11, fontWeight: 600,
            padding: '3px 10px', borderRadius: 20, fontFamily: "'Outfit', sans-serif",
          }}>
            Current plan
          </span>
        </div>

        {/* Usage bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>
              {artworkCount} of {artworkLimit ?? '∞'} artworks used
            </span>
            <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>{artworkLimit ? `${pct}%` : 'Unlimited'}</span>
          </div>
          <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3 }}>
            <div style={{
              height: '100%', width: `${artworkLimit ? pct : 40}%`,
              background: pct >= 90 ? '#E24B4A' : '#14B860', borderRadius: 3,
            }} />
          </div>
        </div>

        {/* Features list */}
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {currentPlan.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ color: '#14B860', flexShrink: 0 }}>✓</span>{f}
            </li>
          ))}
        </ul>
      </div>

      {/* Plan comparison */}
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>All plans</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {PLANS.map(plan => {
          const isCurrent = plan.key === tier;
          return (
            <div key={plan.key} style={{
              flex: 1, border: `2px solid ${isCurrent ? '#14B860' : '#E5E7EB'}`,
              borderRadius: 10, padding: 20, background: isCurrent ? '#E8F7EF' : '#fff',
              position: 'relative',
            }}>
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: '#14B860', color: '#fff', fontSize: 9, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap',
                  fontFamily: "'Outfit', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Current plan
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: '#14B860', fontWeight: 500, fontFamily: "'Outfit', sans-serif", marginBottom: 14 }}>{plan.price}</div>
              <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 11, color: '#6B7280', fontFamily: "'Outfit', sans-serif", paddingLeft: 12, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#14B860' }}>·</span>{f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div style={{
                  textAlign: 'center', padding: '7px 0', borderRadius: 6, fontSize: 12,
                  fontFamily: "'Outfit', sans-serif", color: '#0D7A3E', fontWeight: 500,
                  border: '1.5px solid #14B860',
                }}>
                  ✓ Current plan
                </div>
              ) : (
                <button
                  onClick={() => console.log(`Upgrade to ${plan.name}`)}
                  style={{
                    width: '100%', padding: '7px 0', borderRadius: 6, fontSize: 12,
                    fontFamily: "'Outfit', sans-serif", fontWeight: 500, cursor: 'pointer',
                    border: '1.5px solid #111827', background: '#111827', color: '#fff',
                  }}
                >
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Billing section — hidden for free */}
      {!isFree && (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Billing</div>
          <div style={{ fontSize: 13, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>
            Payment method: Visa ending in 4242
          </div>
          <div style={{ fontSize: 13, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>
            Next charge: $99.00 on May 1, 2026
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{
              padding: '7px 16px', background: '#fff', color: '#374151',
              border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>
              Download invoice
            </button>
            <button style={{
              background: 'none', border: 'none', color: '#E24B4A', fontSize: 12,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>
              Cancel subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
