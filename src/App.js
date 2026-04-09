import React, { useState, useEffect, Component } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { subscribeToArtworks, saveArtwork } from './services/artworkService';
import { subscribeToSubmissions } from './services/submissionService';
import { subscribeToExhibitions, createExhibition } from './services/exhibitionService';
import { createVenue, subscribeToVenue, setCurrentVenue, migrateInlineVenue } from './services/venueService';
import Sidebar from './components/Sidebar';
import GalleryLiteSidebar from './components/GalleryLiteSidebar';
import OnboardingWizard from './components/OnboardingWizard';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
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
import Submissions from './pages/Submissions';
import * as mockData from './data/mockData';

// Always run in authenticated mode (auth check runs on every load)
const IS_ONBOARDING_URL = true;

// ── Error Boundary ─────────────────────────────────────────────────────────
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

function InstitutionPage({ page, artworks, artworksLoading, submissions, submissionsLoading, uid, venueId }) {
  switch (page) {
    case 'ada':         return <ADAScorecard artworks={artworks} artworksLoading={artworksLoading} />;
    case 'analytics':   return <VisitorAnalytics artworks={artworks} artworksLoading={artworksLoading} />;
    case 'artworks':    return <Artworks venue={null} />;
    case 'audio':       return <AudioDescriptions artworks={artworks} artworksLoading={artworksLoading} />;
    case 'anchors':     return <ARAnchors artworks={artworks} artworksLoading={artworksLoading} />;
    case 'reports':     return <GrantReports artworks={artworks} artworksLoading={artworksLoading} />;
    case 'submissions': return <Submissions submissions={submissions} submissionsLoading={submissionsLoading} uid={uid} venueId={venueId} />;
    default:            return <ADAScorecard artworks={artworks} artworksLoading={artworksLoading} />;
  }
}

function GalleryLitePage({ page, venue, artworks, artworksLoading, exhibitions, uid, onNavigate, onNewExhibition, onArtworkAdded, onVenueUpdate }) {
  switch (page) {
    case 'gallery-home':     return <GalleryHome venue={venue} artworks={artworks} exhibitions={exhibitions} onNavigate={onNavigate} onNewExhibition={onNewExhibition} onVenueUpdate={onVenueUpdate} />;
    case 'artworks':         return <Artworks venue={venue} artworks={artworks} artworksLoading={artworksLoading} uid={uid} onArtworkAdded={onArtworkAdded} />;
    case 'qr-sharing':       return <QRSharing venue={venue} artworks={artworks} />;
    case 'visitor-insights': return <VisitorInsights venue={venue} />;
    case 'plan-billing':     return <PlanBilling venue={venue} />;
    default:                 return <GalleryHome venue={venue} artworks={artworks} exhibitions={exhibitions} onNavigate={onNavigate} onNewExhibition={onNewExhibition} onVenueUpdate={onVenueUpdate} />;
  }
}

// ── Loading screen ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#F4F6F3',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 28, height: 28, position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', width: 12, height: 12, top: 0, left: 0, background: '#14B860', borderRadius: '3px 3px 12px 3px' }} />
          <div style={{ position: 'absolute', width: 12, height: 12, top: 0, right: 0, border: '1.5px solid #14B860', borderRadius: '3px 3px 3px 12px', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', width: 12, height: 12, bottom: 0, left: 0, border: '1.5px solid #14B860', borderRadius: '3px 12px 3px 3px', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', width: 12, height: 12, bottom: 0, right: 0, background: '#14B860', borderRadius: '12px 3px 3px 3px' }} />
        </div>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#111827', letterSpacing: '0.02em' }}>gestalt</span>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: '2px solid #E5E7EB', borderTopColor: '#14B860',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  // 'checking' while Firebase resolves the session | 'login' | 'register' | 'authenticated'
  const [authScreen, setAuthScreen] = useState(IS_ONBOARDING_URL ? 'checking' : 'authenticated');
  const [userProfile, setUserProfile] = useState(null); // Firestore user doc

  const [page, setPage] = useState('ada');
  const [venue, setVenue] = useState(IS_ONBOARDING_URL ? mockData.venueGalleryDemo : mockData.venue);
  const [exhibitions, setExhibitions] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  // Multi-tenant state
  const [currentVenueId, setCurrentVenueId] = useState(null);
  const [userVenues, setUserVenues] = useState([]); // [{ id, name, role }]

  // ── Firebase session check ───────────────────────────────────────────────
  useEffect(() => {
    if (!IS_ONBOARDING_URL) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const profile = snap.exists() ? snap.data() : { uid: firebaseUser.uid, email: firebaseUser.email };
          setUserProfile(profile);

          // Multi-tenant: check for venues array
          if (profile.venues?.length > 0) {
            // Has venues — load them
            setUserVenues(profile.venues);
            const venueId = profile.currentVenueId || profile.venues[0].id;
            setCurrentVenueId(venueId);
            applyProfile(profile);
          } else if (profile.venue && profile.onboardingComplete) {
            // Old inline venue — migrate to multi-tenant schema
            try {
              const migratedId = await migrateInlineVenue(profile);
              if (migratedId) {
                setUserVenues([{ id: migratedId, name: profile.venue.name || '', role: 'owner' }]);
                setCurrentVenueId(migratedId);
              }
            } catch (e) {
              console.warn('Migration failed, using inline venue:', e);
            }
            applyProfile(profile);
          } else {
            // No venues, no inline venue — needs onboarding
            applyProfile(profile);
          }

          setAuthScreen('authenticated');
        } catch {
          setAuthScreen('login');
        }
      } else {
        setAuthScreen('login');
      }
    });

    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Firestore subscriptions — artworks + exhibitions + venue ────────────
  useEffect(() => {
    if (!currentVenueId) return;

    // Reset state when switching venues
    setArtworksLoading(true);
    setArtworks([]);
    setExhibitions([]);
    setSubmissionsLoading(true);
    setSubmissions([]);

    let firstArtworkSnapshot = true;
    const unsubArtworks = subscribeToArtworks(currentVenueId, (arts) => {
      setArtworks(arts);
      if (firstArtworkSnapshot) {
        setArtworksLoading(false);
        firstArtworkSnapshot = false;
      }
    });

    const unsubExhibitions = subscribeToExhibitions(currentVenueId, setExhibitions);

    const unsubVenue = subscribeToVenue(currentVenueId, (venueDoc) => {
      if (venueDoc) {
        setVenue(prev => ({ ...prev, ...venueDoc }));
      }
    });

    const unsubSubmissions = subscribeToSubmissions((subs) => {
      setSubmissions(subs);
      setSubmissionsLoading(false);
    });

    return () => {
      unsubArtworks();
      unsubExhibitions();
      unsubVenue();
      unsubSubmissions();
    };
  }, [currentVenueId]);

  function applyProfile(profile) {
    setVenue(prev => ({
      ...prev,
      onboardingComplete: profile.onboardingComplete || false,
      owner: {
        name: profile.name || '',
        role: profile.position || '',
        initials: profile.initials || '',
      },
    }));
    if (profile.onboardingComplete) setPage('gallery-home');
  }

  // ── Auth handlers ────────────────────────────────────────────────────────
  function handleRegistered({ uid, email, name, position, initials }) {
    const profile = { uid, email, name, position, initials, onboardingComplete: false };
    setUserProfile(profile);
    setVenue(prev => ({ ...prev, owner: { name, role: position, initials } }));
    setAuthScreen('authenticated');
  }

  function handleLoggedIn(profile) {
    setUserProfile(profile);
    applyProfile(profile);
    setAuthScreen('authenticated');
  }

  // ── App handlers ─────────────────────────────────────────────────────────
  async function handleOnboardingComplete(venueData) {
    const { _targetPage, _artworkData, ...rest } = venueData;
    setVenue(prev => ({ ...prev, ...rest }));
    setPage(_targetPage || 'gallery-home');

    // Create venue document via venueService
    if (userProfile?.uid) {
      try {
        const newVenueId = await createVenue(rest, userProfile.uid, userProfile);
        setCurrentVenueId(newVenueId);
        setUserVenues(prev => [...prev, { id: newVenueId, name: rest.name || '', role: 'owner' }]);

        // Save the first artwork from onboarding step 2
        if (_artworkData?.title) {
          await saveArtwork(_artworkData, newVenueId, userProfile.uid);
        }
      } catch (e) {
        console.warn('Could not persist onboarding to Firestore:', e);
      }
    }
  }

  async function handleArtworkAdded(artwork) {
    const venueId = currentVenueId;
    if (venueId && userProfile?.uid) {
      try {
        await saveArtwork(artwork, venueId, userProfile.uid);
      } catch (e) {
        console.error('Failed to save artwork:', e);
        setArtworks(prev => [...prev, { ...artwork, id: 'art_' + Date.now() }]);
      }
    } else {
      setArtworks(prev => [...prev, { ...artwork, id: 'art_' + Date.now() }]);
    }
    setVenue(prev => ({ ...prev, artworkCount: (prev.artworkCount || 0) + 1 }));
  }

  async function handleNewExhibition(exh) {
    setActiveModal(null);
    const venueId = currentVenueId;
    if (venueId && userProfile?.uid) {
      try {
        await createExhibition(exh, venueId);
      } catch (e) {
        console.error('Failed to save exhibition:', e);
        setExhibitions(prev => [{ ...exh, id: 'exh_' + Date.now() }, ...prev]);
      }
    } else {
      setExhibitions(prev => [{ ...exh, id: 'exh_' + Date.now() }, ...prev]);
    }
  }

  // ── Venue switching ─────────────────────────────────────────────────────
  async function switchVenue(venueId) {
    if (venueId === currentVenueId) return;
    setCurrentVenueId(venueId);
    // Update venue state from the venues list
    const venueEntry = userVenues.find(v => v.id === venueId);
    if (venueEntry) {
      setVenue(prev => ({ ...prev, name: venueEntry.name }));
    }
    setPage('gallery-home');
    // Persist selection
    if (userProfile?.uid) {
      try { await setCurrentVenue(userProfile.uid, venueId); } catch (e) {
        console.warn('Could not persist venue selection:', e);
      }
    }
  }

  function switchToGalleryLiteDemo() {
    setVenue(mockData.venueGalleryDemo);
    setArtworks([]);
    setExhibitions(mockData.exhibitions);
    setArtworksLoading(false);
    setPage('gallery-home');
  }

  function switchBackToInstitution() {
    setVenue(mockData.venue);
    setExhibitions(mockData.exhibitions);
    setPage('ada');
  }

  // ── Auth screens ─────────────────────────────────────────────────────────
  if (authScreen === 'checking') return <LoadingScreen />;

  if (authScreen === 'login') {
    return (
      <LoginForm
        onLoggedIn={handleLoggedIn}
        onShowRegister={() => setAuthScreen('register')}
      />
    );
  }

  if (authScreen === 'register') {
    return (
      <RegistrationForm
        onRegistered={handleRegistered}
        onShowLogin={() => setAuthScreen('login')}
      />
    );
  }

  const onboardingComplete = venue.onboardingComplete;
  const isInstitution = venue.tier === 'institution';

  // ── Onboarding ────────────────────────────────────────────────────────────
  if (!onboardingComplete) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // ── Institution tier ──────────────────────────────────────────────────────
  if (isInstitution) {
    return (
      <div style={{
        display: 'flex', width: '100vw', height: '100vh',
        overflow: 'hidden', background: '#FCFCFC', fontFamily: "'Outfit', sans-serif",
      }}>
        <ErrorBoundary>
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
          <Sidebar activePage={page} onNavigate={setPage} venue={venue} userVenues={userVenues} currentVenueId={currentVenueId} onSwitchVenue={switchVenue} userProfile={userProfile} pendingSubmissions={submissions.filter(s => s.status === 'pending_review').length} />
          <ErrorBoundary><InstitutionPage page={page} artworks={artworks} artworksLoading={artworksLoading} submissions={submissions} submissionsLoading={submissionsLoading} uid={userProfile?.uid} venueId={currentVenueId} /></ErrorBoundary>
        </ErrorBoundary>
      </div>
    );
  }

  // ── Gallery Lite tier ─────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh',
      overflow: 'hidden', background: '#FCFCFC', fontFamily: "'Outfit', sans-serif",
      position: 'relative',
    }}>
      <ErrorBoundary>
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

        <GalleryLiteSidebar activePage={page} onNavigate={setPage} venue={venue} userVenues={userVenues} currentVenueId={currentVenueId} onSwitchVenue={switchVenue} userProfile={userProfile} />
        <ErrorBoundary>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: venue.id === 'venue_demo' ? 36 : 0 }}>
            <GalleryLitePage
              page={page}
              venue={venue}
              artworks={artworks}
              artworksLoading={artworksLoading}
              exhibitions={exhibitions}
              uid={userProfile?.uid}
              onNavigate={setPage}
              onNewExhibition={() => setActiveModal('new-exhibition')}
              onArtworkAdded={handleArtworkAdded}
              onVenueUpdate={data => setVenue(v => ({ ...v, ...data }))}
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
