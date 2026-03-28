import React, { useState, Component } from 'react';
import Sidebar from './components/Sidebar';
import GalleryLiteSidebar from './components/GalleryLiteSidebar';
import OnboardingWizard from './components/OnboardingWizard';
import ExhibitionModal from './components/ExhibitionModal';
import ADAScorecard from './pages/ADAScorecard';
import VisitorAnalytics from './pages/VisitorAnalytics';
import Artworks from './pages/Artworks';
import AudioDescriptions from './pages/AudioDescriptions';
import ARAnchors from './pages/ARAnchors';
import GrantReports from './pages/GrantReports';
import GalleryHome from './pages/GalleryHome';
import QRSharing from './pages/QRSharing';
import VisitorInsights from './pages/VisitorInsights';
import PlanBilling from './pages/PlanBilling';
import * as mockData from './data/mockData';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#E24B4A' }}>
          <strong>Render error:</strong>
          <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function InstitutionPage({ page, venue, artworks, exhibitions, onArtworkAdded }) {
  switch (page) {
    case 'ada':       return <ADAScorecard />;
    case 'analytics': return <VisitorAnalytics />;
    case 'artworks':  return <Artworks venue={null} />;
    case 'audio':     return <AudioDescriptions />;
    case 'anchors':   return <ARAnchors />;
    case 'reports':   return <GrantReports />;
    default:          return <ADAScorecard />;
  }
}

function GalleryLitePage({ page, venue, artworks, exhibitions, onNavigate, onNewExhibition, onArtworkAdded }) {
  switch (page) {
    case 'gallery-home':     return <GalleryHome venue={venue} exhibitions={exhibitions} onNavigate={onNavigate} onNewExhibition={onNewExhibition} />;
    case 'artworks':         return <Artworks venue={venue} artworks={artworks} onArtworkAdded={onArtworkAdded} />;
    case 'qr-sharing':       return <QRSharing venue={venue} artworks={artworks} />;
    case 'visitor-insights': return <VisitorInsights venue={venue} />;
    case 'plan-billing':     return <PlanBilling venue={venue} />;
    default:                 return <GalleryHome venue={venue} exhibitions={exhibitions} onNavigate={onNavigate} onNewExhibition={onNewExhibition} />;
  }
}

export default function App() {
  const [page, setPage] = useState('ada');
  const [venue, setVenue] = useState(mockData.venue);
  const [exhibitions, setExhibitions] = useState(mockData.exhibitions);
  const [artworks, setArtworks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  const isInstitution = venue.tier === 'institution';
  const onboardingComplete = venue.onboardingComplete;

  function handleOnboardingComplete(venueData) {
    setVenue(prev => ({ ...prev, ...venueData }));
    setPage('gallery-home');
  }

  function handleArtworkAdded(artwork) {
    setArtworks(prev => [...prev, artwork]);
    setVenue(prev => ({ ...prev, artworkCount: (prev.artworkCount || 0) + 1 }));
  }

  function handleNewExhibition(exh) {
    setExhibitions(prev => [exh, ...prev]);
    setActiveModal(null);
  }

  function switchToGalleryLiteDemo() {
    setVenue(mockData.venueGalleryDemo);
    setArtworks([]);
    setPage('gallery-home');
  }

  function switchBackToInstitution() {
    setVenue(mockData.venue);
    setPage('ada');
  }

  // ── Onboarding ──────────────────────────────────────────────────────────────
  if (!onboardingComplete) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // ── Institution tier ────────────────────────────────────────────────────────
  if (isInstitution) {
    return (
      <div style={{
        display: 'flex', width: '100vw', height: '100vh',
        overflow: 'hidden', background: '#FCFCFC', fontFamily: "'Outfit', sans-serif",
      }}>
        <ErrorBoundary>
          {/* Demo mode toggle */}
          <div style={{ position: 'absolute', top: 14, right: 20, zIndex: 50 }}>
            <button
              onClick={switchToGalleryLiteDemo}
              style={{
                padding: '6px 14px', background: 'rgba(20,184,96,0.1)', color: '#14B860',
                border: '1px solid rgba(20,184,96,0.3)', borderRadius: 20, fontSize: 11,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500,
              }}
            >
              Preview Gallery Lite
            </button>
          </div>

          <Sidebar activePage={page} onNavigate={setPage} />
          <ErrorBoundary>
            <InstitutionPage page={page} />
          </ErrorBoundary>
        </ErrorBoundary>
      </div>
    );
  }

  // ── Gallery Lite tier ───────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh',
      overflow: 'hidden', background: '#FCFCFC', fontFamily: "'Outfit', sans-serif",
      position: 'relative',
    }}>
      <ErrorBoundary>
        {/* Demo mode banner */}
        {venue.id === 'venue_demo' && (
          <div style={{
            position: 'absolute', top: 0, left: 220, right: 0, zIndex: 50,
            background: '#111827', color: '#fff', padding: '8px 20px',
            fontSize: 12, fontFamily: "'Outfit', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Demo mode — viewing Gallery Lite experience.</span>
            <button onClick={switchBackToInstitution} style={{
              background: 'none', border: 'none', color: '#14B860', fontSize: 12,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500,
            }}>
              Switch back to Institution →
            </button>
          </div>
        )}

        <GalleryLiteSidebar activePage={page} onNavigate={setPage} venue={venue} />
        <ErrorBoundary>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: venue.id === 'venue_demo' ? 36 : 0 }}>
            <GalleryLitePage
              page={page}
              venue={venue}
              artworks={artworks}
              exhibitions={exhibitions}
              onNavigate={setPage}
              onNewExhibition={() => setActiveModal('new-exhibition')}
              onArtworkAdded={handleArtworkAdded}
            />
          </div>
        </ErrorBoundary>

        {activeModal === 'new-exhibition' && (
          <ExhibitionModal
            artworks={artworks}
            onSubmit={handleNewExhibition}
            onClose={() => setActiveModal(null)}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}
