// ── Audio Service ────────────────────────────────────────────────────────────
// Calls the describeArtwork Cloud Function to generate a visual description,
// audio script, and TTS audio for a given artwork. Writes results back to
// the artwork's Firestore doc via updateArtwork.

import { getAuth } from 'firebase/auth';
import { updateArtwork } from './artworkService';

const CF_URL = 'https://us-central1-gestalt-17ce0.cloudfunctions.net/describeArtwork';

/**
 * Generate audio description for an artwork.
 *
 * @param {object} artwork — normalized artwork object from artworkService
 * @param {function} onProgress — optional callback(message: string) for UI steps
 * @returns {Promise<{ visualDescription, audioScript, audioUrl }>}
 */
export async function generateAudioDescription(artwork, onProgress = () => {}) {
  // ── Auth token ────────────────────────────────────────────────────────────
  const user = getAuth().currentUser;
  const token = user ? await user.getIdToken() : null;

  // ── Build image list ──────────────────────────────────────────────────────
  // artwork.images is [{type:'url', src}] from artworkService normalizer
  const images = (artwork.images || [])
    .slice(0, 4)
    .map(img => {
      const src = typeof img === 'string' ? img : img.src;
      if (src && src.startsWith('http')) {
        return { type: 'url', url: src };
      }
      return null;
    })
    .filter(Boolean);

  // ── Build metadata ────────────────────────────────────────────────────────
  const metadata = {
    title:      artwork.title      || undefined,
    artist:     artwork.artist     || undefined,
    year:       artwork.year       || undefined,
    medium:     artwork.medium     || undefined,
    subject:    artwork.subject    || undefined,
    dimensions: artwork.dimensions || undefined,
  };

  // ── Call Cloud Function ───────────────────────────────────────────────────
  onProgress('Generating description…');

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(CF_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ images, metadata }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `Server error ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Unknown error from describeArtwork');
  }

  // ── Persist to Firestore ──────────────────────────────────────────────────
  onProgress('Saving…');

  const updates = {
    visualDescription: result.visualDescription || null,
    audioScript:       result.audioScript       || null,
    audioUrl:          result.audioUrl          || null,
  };

  await updateArtwork(artwork.id, updates);

  onProgress('Done');
  return updates;
}
