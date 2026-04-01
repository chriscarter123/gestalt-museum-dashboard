// ── Metric Derivation Utilities ─────────────────────────────────────────────
// Pure functions that compute dashboard metrics from a real artworks array.
// Every function handles empty arrays gracefully (returns zeros/nulls, not NaN).

/**
 * Audio coverage: how many artworks have audio.
 * covered = has audioUrl (fully generated)
 */
export function deriveAudioCoverage(artworks) {
  if (!artworks?.length) return { percent: 0, covered: 0, total: 0 };
  const covered = artworks.filter(a => !!a.audioUrl).length;
  return {
    percent: Math.round((covered / artworks.length) * 100),
    covered,
    total: artworks.length,
  };
}

/**
 * Audio counts: covered / pending / missing breakdown.
 * covered = has audioUrl, pending = audioScript but no audioUrl, missing = neither
 */
export function deriveAudioCounts(artworks) {
  if (!artworks?.length) return { covered: 0, pending: 0, missing: 0, total: 0 };
  let covered = 0, pending = 0, missing = 0;
  for (const a of artworks) {
    if (a.audioUrl) covered++;
    else if (a.audioScript) pending++;
    else missing++;
  }
  return { covered, pending, missing, total: artworks.length };
}

/**
 * Gallery breakdown: group artworks by gallery, compute per-gallery metrics.
 */
export function deriveGalleryBreakdown(artworks) {
  if (!artworks?.length) return [];
  const groups = {};
  for (const a of artworks) {
    const g = a.gallery && a.gallery !== '—' ? a.gallery : 'Unassigned';
    if (!groups[g]) groups[g] = { artworks: [], arScores: [] };
    groups[g].artworks.push(a);
    if (a.arScore != null) groups[g].arScores.push(a.arScore);
  }
  return Object.entries(groups).map(([name, { artworks: arts, arScores }]) => {
    const audioCount = arts.filter(a => !!a.audioUrl || !!a.audioScript).length;
    return {
      name,
      artworkCount: arts.length,
      audioCoveragePct: Math.round((audioCount / arts.length) * 100),
      avgArScore: arScores.length > 0
        ? +(arScores.reduce((s, v) => s + v, 0) / arScores.length).toFixed(2)
        : null,
      status: audioCount === arts.length ? 'up' : audioCount > 0 ? 'flat' : 'down',
    };
  }).sort((a, b) => b.artworkCount - a.artworkCount);
}

/**
 * Overall AR score: mean of non-null arScore values.
 */
export function deriveOverallArScore(artworks) {
  if (!artworks?.length) return null;
  const scores = artworks.map(a => a.arScore).filter(s => s != null);
  if (!scores.length) return null;
  return +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2);
}

/**
 * Audio track rows for the AudioDescriptions table.
 */
export function deriveAudioTrackRows(artworks) {
  if (!artworks?.length) return [];
  return artworks.map(a => ({
    id: a.id,
    artwork: a.title,
    artist: a.artist,
    lang: '—',           // no language field on artworks yet
    duration: '—',       // would need audio file metadata
    source: a.audioUrl ? 'AI' : a.audioScript ? 'AI (pending)' : '—',
    updatedAt: '—',      // no per-artwork updatedAt exposed
    status: a.audioUrl ? 'published' : a.audioScript ? 'pending' : 'missing',
    audioUrl: a.audioUrl || null,
    audioScript: a.audioScript || null,
    hasAudio: a.hasAudio,
  }));
}

/**
 * Anchor rows: artworks with embeddings (AR-enabled).
 */
export function deriveAnchorRows(artworks) {
  if (!artworks?.length) return [];
  return artworks
    .filter(a => a.embeddings?.length > 0 || a.arScore != null)
    .map(a => ({
      id: a.id,
      gallery: a.gallery || 'Unassigned',
      artwork: a.title,
      anchorId: `ANC-${a.id.slice(0, 8)}`,
      reliability: a.arScore,
      calibrated: '—',    // no calibration date field
      status: a.arScore == null ? 'unknown'
            : a.arScore >= 0.75 ? 'calibrated'
            : a.arScore >= 0.5 ? 'needs_recalibration'
            : 'flagged',
    }));
}

/**
 * Anchor summary counts.
 */
export function deriveAnchorCounts(artworks) {
  const rows = deriveAnchorRows(artworks);
  if (!rows.length) return { total: 0, belowThreshold: 0, avgScore: null };
  const scores = rows.map(r => r.reliability).filter(s => s != null);
  return {
    total: rows.length,
    belowThreshold: scores.filter(s => s < 0.5).length,
    avgScore: scores.length > 0
      ? +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2)
      : null,
  };
}

/**
 * Report preview stats for Grant Reports.
 */
export function deriveReportPreview(artworks) {
  const audio = deriveAudioCoverage(artworks);
  const arScore = deriveOverallArScore(artworks);
  const galleries = new Set(artworks?.map(a => a.gallery).filter(g => g && g !== '—'));
  return {
    totalArtworks: artworks?.length || 0,
    audioCoveragePct: audio.percent,
    avgArScore: arScore,
    galleryCount: galleries.size,
  };
}
