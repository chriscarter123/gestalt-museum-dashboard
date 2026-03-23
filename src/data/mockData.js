// ── Institution ───────────────────────────────────────────────────────────────
export const institution = {
  name: 'Philadelphia Museum of Art',
  lastUpdated: '2 minutes ago',
  user: { initials: 'JM', name: 'Julia Martinez', role: 'Accessibility Officer' },
};

// ── ADA Scorecard ─────────────────────────────────────────────────────────────
export const adaMetrics = [
  { label: 'Audio descriptions', value: '73%', detail: '219 of 302 artworks covered', trend: '+5% ↑ 30d', trendDir: 'up', color: '#14B860', pct: 73 },
  { label: 'Languages',          value: '4',   detail: 'en, es, zh, fr',               trend: '+1 ↑ 30d',  trendDir: 'up', color: '#D4AF37', pct: 40 },
  { label: 'Wheelchair access',  value: '91%', detail: '275 of 302 locations',          trend: '— 30d',     trendDir: 'flat', color: '#14B860', pct: 91 },
  { label: 'AR reliability',     value: '0.74',detail: '12 anchors below 0.5',          trend: '+.03 ↑ 30d', trendDir: 'up', color: '#D4AF37', pct: 74 },
];

export const galleries = [
  { name: 'East Wing — American Art',       artworks: 48, audioCoverage: 92, wheelchair: 100, arScore: 0.89, status: 'Excellent',  statusDir: 'up' },
  { name: 'South Gallery — European',       artworks: 64, audioCoverage: 81, wheelchair: 95,  arScore: 0.82, status: 'Good',       statusDir: 'up' },
  { name: 'Asian Art Galleries',            artworks: 72, audioCoverage: 68, wheelchair: 89,  arScore: 0.71, status: 'Improving',  statusDir: 'flat' },
  { name: 'Modern & Contemporary',          artworks: 56, audioCoverage: 75, wheelchair: 82,  arScore: 0.79, status: 'Good',       statusDir: 'up' },
  { name: 'Perelman Building — Special',    artworks: 38, audioCoverage: 42, wheelchair: 78,  arScore: 0.58, status: 'Needs work', statusDir: 'down' },
  { name: 'Rodin Museum',                   artworks: 24, audioCoverage: 88, wheelchair: 62,  arScore: 0.65, status: 'Mixed',      statusDir: 'flat' },
];

export const audioPlays = [
  { day: 'Mon', plays: 124 },
  { day: 'Tue', plays: 178 },
  { day: 'Wed', plays: 231 },
  { day: 'Thu', plays: 156 },
  { day: 'Fri', plays: 138 },
  { day: 'Sat', plays: 312 },
  { day: 'Sun', plays: 289 },
];

export const languageDemand = [
  { lang: 'English', pct: 62 },
  { lang: 'Spanish', pct: 22 },
  { lang: 'Chinese', pct: 9 },
  { lang: 'French',  pct: 7 },
];

// ── Visitor Analytics ─────────────────────────────────────────────────────────
export const visitorMetrics = [
  { label: 'Total visitors',    value: '12,847', detail: 'This month',           trend: '+8% ↑ 30d',  trendDir: 'up',   color: '#14B860', pct: 80 },
  { label: 'Avg session',       value: '4m 32s', detail: 'Per artwork view',     trend: '+22s ↑ 30d', trendDir: 'up',   color: '#14B860', pct: 68 },
  { label: 'Audio engagement',  value: '68%',    detail: 'Visitors who played',  trend: '-2% ↓ 30d',  trendDir: 'down', color: '#E24B4A', pct: 68 },
  { label: 'Return visitors',   value: '23%',    detail: 'Within 90 days',       trend: '+3% ↑ 30d',  trendDir: 'up',   color: '#D4AF37', pct: 23 },
];

export const visitorsByDay = [
  { day: 'Mon', count: 312 }, { day: 'Tue', count: 289 }, { day: 'Wed', count: 401 },
  { day: 'Thu', count: 356 }, { day: 'Fri', count: 498 }, { day: 'Sat', count: 812 },
  { day: 'Sun', count: 734 },
];

export const galleryTraffic = [
  { name: 'East Wing',    visitors: 3210, pct: 100 },
  { name: 'S. Gallery',   visitors: 2847, pct: 89 },
  { name: 'Asian Art',    visitors: 2401, pct: 75 },
  { name: 'Modern',       visitors: 2188, pct: 68 },
  { name: 'Perelman',     visitors: 1204, pct: 37 },
  { name: 'Rodin',        visitors: 997,  pct: 31 },
];

export const deviceBreakdown = [
  { label: 'iOS app',      pct: 54, color: '#14B860' },
  { label: 'Web (mobile)', pct: 31, color: '#D4AF37' },
  { label: 'Web (desktop)',pct: 15, color: '#888' },
];

// ── Artworks ──────────────────────────────────────────────────────────────────
export const artworksList = [
  { id: 'ART-001', title: 'Water Lilies',               artist: 'Claude Monet',       gallery: 'South Gallery — European',    type: 'Painting',   hasAudio: true,  arScore: 0.91, status: 'active' },
  { id: 'ART-002', title: 'The Gross Clinic',            artist: 'Thomas Eakins',      gallery: 'East Wing — American Art',     type: 'Painting',   hasAudio: true,  arScore: 0.87, status: 'active' },
  { id: 'ART-003', title: 'The Thinker',                 artist: 'Auguste Rodin',      gallery: 'Rodin Museum',                 type: 'Sculpture',  hasAudio: false, arScore: 0.65, status: 'active' },
  { id: 'ART-004', title: 'Arrangement in Grey and Black', artist: 'James Whistler',  gallery: 'East Wing — American Art',     type: 'Painting',   hasAudio: true,  arScore: 0.88, status: 'active' },
  { id: 'ART-005', title: 'The Large Bathers',           artist: 'Paul Cézanne',       gallery: 'South Gallery — European',    type: 'Painting',   hasAudio: false, arScore: 0.79, status: 'active' },
  { id: 'ART-006', title: 'Dream of the Red Chamber',   artist: 'Anonymous',          gallery: 'Asian Art Galleries',          type: 'Scroll',     hasAudio: false, arScore: 0.44, status: 'unverified' },
  { id: 'ART-007', title: 'Untitled (Blue Period)',      artist: 'Pablo Picasso',       gallery: 'Modern & Contemporary',       type: 'Painting',   hasAudio: true,  arScore: 0.82, status: 'active' },
  { id: 'ART-008', title: 'Bronze Mirror with Deity',   artist: 'Unknown, Tang Dyn.', gallery: 'Asian Art Galleries',          type: 'Metalwork',  hasAudio: false, arScore: 0.38, status: 'unverified' },
  { id: 'ART-009', title: 'Philadelphia Toboggan',       artist: 'Various',            gallery: 'Perelman Building — Special', type: 'Installation', hasAudio: false, arScore: 0.58, status: 'active' },
  { id: 'ART-010', title: 'Sunflowers',                  artist: 'Vincent van Gogh',   gallery: 'South Gallery — European',    type: 'Painting',   hasAudio: true,  arScore: 0.93, status: 'active' },
  { id: 'ART-011', title: 'Nude Descending a Staircase', artist: 'Marcel Duchamp',    gallery: 'Modern & Contemporary',       type: 'Painting',   hasAudio: true,  arScore: 0.76, status: 'active' },
  { id: 'ART-012', title: 'Vase with Flowers',           artist: 'Jan Brueghel',       gallery: 'South Gallery — European',    type: 'Painting',   hasAudio: false, arScore: 0.61, status: 'deteriorating' },
];

// ── Audio Descriptions ────────────────────────────────────────────────────────
export const audioMetrics = [
  { label: 'Covered',           value: '219', detail: 'of 302 artworks',  trend: '+11 ↑ 30d',  trendDir: 'up',   color: '#14B860', pct: 73 },
  { label: 'Pending generation',value: '28',  detail: 'queued for AI gen', trend: '-4 ↓ 30d',   trendDir: 'flat', color: '#D4AF37', pct: 28 },
  { label: 'Missing',           value: '55',  detail: 'no audio at all',   trend: '-11 ↓ 30d',  trendDir: 'up',   color: '#E24B4A', pct: 18 },
  { label: 'Languages',         value: '4',   detail: 'en, es, zh, fr',    trend: '+1 ↑ 30d',   trendDir: 'up',   color: '#D4AF37', pct: 40 },
];

export const audioTracks = [
  { artwork: 'Water Lilies',            artist: 'Claude Monet',    lang: 'EN', duration: '1m 42s', source: 'AI', updatedAt: '2026-03-20', status: 'published' },
  { artwork: 'Water Lilies',            artist: 'Claude Monet',    lang: 'ES', duration: '1m 38s', source: 'AI', updatedAt: '2026-03-21', status: 'published' },
  { artwork: 'The Gross Clinic',        artist: 'Thomas Eakins',   lang: 'EN', duration: '2m 04s', source: 'Manual', updatedAt: '2026-03-18', status: 'published' },
  { artwork: 'The Thinker',             artist: 'Auguste Rodin',   lang: 'EN', duration: '—',      source: '—',    updatedAt: '—',          status: 'missing' },
  { artwork: 'Arrangement in Grey',     artist: 'James Whistler',  lang: 'EN', duration: '1m 51s', source: 'AI', updatedAt: '2026-03-19', status: 'published' },
  { artwork: 'The Large Bathers',       artist: 'Paul Cézanne',    lang: 'EN', duration: '—',      source: '—',    updatedAt: '—',          status: 'pending' },
  { artwork: 'Dream of the Red Chamber',artist: 'Anonymous',       lang: 'ZH', duration: '—',      source: '—',    updatedAt: '—',          status: 'pending' },
  { artwork: 'Sunflowers',              artist: 'Vincent van Gogh',lang: 'EN', duration: '1m 29s', source: 'AI', updatedAt: '2026-03-22', status: 'published' },
  { artwork: 'Sunflowers',              artist: 'Vincent van Gogh',lang: 'FR', duration: '1m 33s', source: 'AI', updatedAt: '2026-03-22', status: 'published' },
  { artwork: 'Nude Descending',         artist: 'Marcel Duchamp',  lang: 'EN', duration: '2m 11s', source: 'Manual', updatedAt: '2026-03-15', status: 'published' },
];

// ── AR Anchors ────────────────────────────────────────────────────────────────
export const anchorMetrics = [
  { label: 'Total anchors',     value: '302',  detail: 'across all galleries',   trend: '+8 ↑ 30d',   trendDir: 'up',   color: '#14B860', pct: 100 },
  { label: 'Avg reliability',   value: '0.74', detail: 'cosine similarity mean',  trend: '+.03 ↑ 30d', trendDir: 'up',   color: '#D4AF37', pct: 74 },
  { label: 'Below threshold',   value: '12',   detail: 'score < 0.5',             trend: '-3 ↓ 30d',   trendDir: 'up',   color: '#E24B4A', pct: 4 },
  { label: 'Calibrated today',  value: '7',    detail: 'recalibrated this session',trend: '+7 ↑ 24h',  trendDir: 'up',   color: '#14B860', pct: 60 },
];

export const anchors = [
  { gallery: 'East Wing — American Art',    artwork: 'The Gross Clinic',           id: 'ANC-0012', reliability: 0.87, calibrated: '2026-03-22', status: 'calibrated' },
  { gallery: 'East Wing — American Art',    artwork: 'Arrangement in Grey',        id: 'ANC-0013', reliability: 0.91, calibrated: '2026-03-22', status: 'calibrated' },
  { gallery: 'South Gallery — European',    artwork: 'Water Lilies',               id: 'ANC-0028', reliability: 0.94, calibrated: '2026-03-21', status: 'calibrated' },
  { gallery: 'South Gallery — European',    artwork: 'The Large Bathers',          id: 'ANC-0031', reliability: 0.79, calibrated: '2026-03-18', status: 'calibrated' },
  { gallery: 'Asian Art Galleries',         artwork: 'Dream of the Red Chamber',   id: 'ANC-0044', reliability: 0.44, calibrated: '2026-02-28', status: 'needs_recalibration' },
  { gallery: 'Asian Art Galleries',         artwork: 'Bronze Mirror with Deity',   id: 'ANC-0046', reliability: 0.38, calibrated: '2026-02-14', status: 'needs_recalibration' },
  { gallery: 'Modern & Contemporary',       artwork: 'Untitled (Blue Period)',      id: 'ANC-0058', reliability: 0.82, calibrated: '2026-03-20', status: 'calibrated' },
  { gallery: 'Modern & Contemporary',       artwork: 'Nude Descending a Staircase',id: 'ANC-0061', reliability: 0.76, calibrated: '2026-03-19', status: 'calibrated' },
  { gallery: 'Perelman Building — Special', artwork: 'Philadelphia Toboggan',       id: 'ANC-0074', reliability: 0.58, calibrated: '2026-03-10', status: 'needs_recalibration' },
  { gallery: 'Rodin Museum',                artwork: 'The Thinker',                id: 'ANC-0088', reliability: 0.65, calibrated: '2026-03-05', status: 'flagged' },
];

// ── Grant Reports ─────────────────────────────────────────────────────────────
export const reportHistory = [
  { name: 'ADA Annual Compliance Report',     period: 'FY 2025',        generated: '2026-01-14', format: 'PDF', status: 'final' },
  { name: 'Audio Coverage Assessment',        period: 'Q3 2025',        generated: '2025-10-02', format: 'PDF', status: 'final' },
  { name: 'Accessibility Grant Summary',      period: 'FY 2025',        generated: '2025-12-19', format: 'PDF', status: 'final' },
  { name: 'ADA Annual Compliance Report',     period: 'FY 2024',        generated: '2025-01-09', format: 'PDF', status: 'final' },
  { name: 'AR Reliability Audit',             period: 'Q1 2026',        generated: '2026-03-01', format: 'PDF', status: 'draft' },
];
