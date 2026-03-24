import React, { useState, Component } from 'react';
import Sidebar from './components/Sidebar';
import ADAScorecard from './pages/ADAScorecard';
import VisitorAnalytics from './pages/VisitorAnalytics';
import Artworks from './pages/Artworks';
import AudioDescriptions from './pages/AudioDescriptions';
import ARAnchors from './pages/ARAnchors';
import GrantReports from './pages/GrantReports';

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

function CurrentPage({ page }) {
  switch (page) {
    case 'ada':       return <ADAScorecard />;
    case 'analytics': return <VisitorAnalytics />;
    case 'artworks':  return <Artworks />;
    case 'audio':     return <AudioDescriptions />;
    case 'anchors':   return <ARAnchors />;
    case 'reports':   return <GrantReports />;
    default:          return <ADAScorecard />;
  }
}

export default function App() {
  const [page, setPage] = useState('ada');
  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#FCFCFC',
      fontFamily: "'Outfit', sans-serif",
    }}>
      <ErrorBoundary>
        <Sidebar activePage={page} onNavigate={setPage} />
        <ErrorBoundary>
          <CurrentPage page={page} />
        </ErrorBoundary>
      </ErrorBoundary>
    </div>
  );
}
