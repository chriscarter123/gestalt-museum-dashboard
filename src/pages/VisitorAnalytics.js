import React from 'react';
import PageShell from '../components/PageShell';
import { PlaceholderCard, PlaceholderMetricCard } from '../components/PlaceholderCard';
import { institution } from '../data/mockData';

export default function VisitorAnalytics({ artworks = [], artworksLoading = false }) {
  return (
    <PageShell
      eyebrow="Analytics"
      title="Visitor analytics"
      subtitle={`${institution.name}`}
    >
      {/* Metric cards — all placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <PlaceholderMetricCard label="Total visitors" systemName="analytics service" />
        <PlaceholderMetricCard label="Avg session" systemName="analytics service" />
        <PlaceholderMetricCard label="Audio engagement" systemName="analytics service" />
        <PlaceholderMetricCard label="Return visitors" systemName="analytics service" />
      </div>

      {/* Charts — all placeholder */}
      <PlaceholderCard icon="📈" systemName="visitor tracking" description="Daily visitor counts, trends, and period comparisons" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <PlaceholderCard icon="🏛" systemName="gallery tracking" description="Visitor distribution across galleries and exhibitions" />
        <PlaceholderCard icon="📱" systemName="device analytics" description="iOS app, mobile web, and desktop breakdown" />
      </div>

      <div style={{
        textAlign: 'center', padding: '32px 24px', marginTop: 24,
        fontSize: 13, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif",
      }}>
        Visitor analytics requires connecting an event tracking system.
      </div>
    </PageShell>
  );
}
