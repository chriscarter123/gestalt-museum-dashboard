import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ADAScorecard from './pages/ADAScorecard';
import VisitorAnalytics from './pages/VisitorAnalytics';
import Artworks from './pages/Artworks';
import AudioDescriptions from './pages/AudioDescriptions';
import ARAnchors from './pages/ARAnchors';
import GrantReports from './pages/GrantReports';

const PAGES = {
  ada:       <ADAScorecard />,
  analytics: <VisitorAnalytics />,
  artworks:  <Artworks />,
  audio:     <AudioDescriptions />,
  anchors:   <ARAnchors />,
  reports:   <GrantReports />,
};

export default function App() {
  const [page, setPage] = useState('ada');

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#f0f0ee',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        display: 'flex', width: '100%', maxWidth: 1100,
        minHeight: 640, borderRadius: 12, overflow: 'hidden',
        border: '0.5px solid rgba(0,0,0,0.08)',
        background: '#FCFCFC',
        boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
      }}>
        <Sidebar activePage={page} onNavigate={setPage} />
        {PAGES[page] || <ADAScorecard />}
      </div>
    </div>
  );
}
