// ── Artwork Service ─────────────────────────────────────────────────────────
// Firestore CRUD + real-time subscription for artworks.
// venueId = user's Firebase Auth UID (1:1 mapping for Gallery Lite).

import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { uploadArtworkImage } from './storageService';

const COLLECTION = 'artworks';

/**
 * Subscribe to artworks for a venue. Returns unsubscribe function.
 * @param {string} venueId — Firebase Auth UID of the venue owner
 * @param {(artworks: Array) => void} callback — receives normalized artwork array
 * @returns {() => void} unsubscribe
 */
export function subscribeToArtworks(venueId, callback) {
  if (!venueId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where('venueId', '==', venueId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const artworks = snapshot.docs.map(d => normalizeArtwork(d));
    callback(artworks);
  }, (err) => {
    console.error('[artworkService] Subscription error:', err);
    // If the error is about a missing index, Firestore logs the creation URL
    callback([]);
  });
}

/**
 * Save a new artwork or update an existing one.
 * @param {object} data — artwork fields from ArtworkEditorModal or onboarding
 * @param {string} venueId
 * @param {string} uid — creator's Firebase Auth UID
 * @returns {Promise<string>} — document ID
 */
export async function saveArtwork(data, venueId, uid) {
  const { id, ...fields } = data;

  // Upload any blob-URL images to Firebase Storage before saving
  if (fields.images && fields.images.length > 0) {
    fields.images = await persistImages(fields.images, venueId);
  }

  // Clean up internal fields that shouldn't go to Firestore
  delete fields._raw;

  // Normalize fields for Firestore
  const doc_data = {
    ...fields,
    venueId,
    createdBy: uid,
    // Ensure compatibility with museum-ar-app visitor app
    artist_culture: fields.artist || fields.artist_culture || null,
    status: fields.status || 'active',
  };

  if (id && !id.startsWith('art_') && !id.startsWith('ART-')) {
    // Existing Firestore doc — update
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, { ...doc_data, updatedAt: serverTimestamp() });
    return id;
  } else {
    // New artwork
    doc_data.createdAt = serverTimestamp();
    doc_data.updatedAt = serverTimestamp();
    const ref = await addDoc(collection(db, COLLECTION), doc_data);
    return ref.id;
  }
}

/**
 * Upload blob-URL images to Firebase Storage and replace with permanent URLs.
 * URL-type images are kept as-is. Returns the updated images array.
 */
async function persistImages(images, venueId) {
  const results = await Promise.all(
    images.map(async (img) => {
      // Already a permanent URL — keep it
      if (img.type === 'url' || (typeof img === 'string')) {
        return typeof img === 'string' ? img : img.src;
      }

      // Blob URL — upload to Storage
      if (img.type === 'upload' && img.src && img.src.startsWith('blob:')) {
        try {
          const url = await uploadArtworkImage(img.src, venueId, img.name);
          return url;
        } catch (e) {
          console.warn('[artworkService] Image upload failed, skipping:', e.message);
          return null;
        }
      }

      // Already a Firebase URL (re-save scenario) — keep it
      if (img.src && img.src.startsWith('http')) {
        return img.src;
      }

      return null;
    })
  );

  // Filter out failed uploads, return flat array of URL strings
  return results.filter(Boolean);
}

/**
 * Update specific fields on an artwork.
 */
export async function updateArtwork(artworkId, fields) {
  const ref = doc(db, COLLECTION, artworkId);
  await updateDoc(ref, { ...fields, updatedAt: serverTimestamp() });
}

/**
 * Delete an artwork.
 */
export async function deleteArtwork(artworkId) {
  const ref = doc(db, COLLECTION, artworkId);
  await deleteDoc(ref);
}

// ── Normalizer ──────────────────────────────────────────────────────────────
// Maps Firestore document to the shape the Artworks page and other components expect.

function normalizeArtwork(docSnap) {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    title: d.title || 'Untitled',
    artist: d.artist || d.artist_culture || 'Unknown',
    gallery: d.gallery || d.location?.gallery || '—',
    type: d.type || 'Other',
    hasAudio: !!(d.audioUrl || d.audioScript),
    arScore: d.arScore ?? null,
    status: d.status || 'active',
    year: d.year || null,
    medium: d.medium || null,
    // Images stored as flat URL strings in Firestore; convert back to {type, src} for editor
    images: (d.images || []).map(img =>
      typeof img === 'string' ? { type: 'url', src: img } : img
    ),
    description: d.description || d.visualDescription || null,
    audioScript: d.audioScript || null,
    audioUrl: d.audioUrl || null,
    visualDescription: d.visualDescription || null,
    location: d.location || null,
    embeddings: d.embeddings || [],
    qrCode: d.qrCode || null,
    dimensions: d.dimensions || null,
    style: d.style || null,
    subject: d.subject || null,
    tags: d.tags || [],
    condition: d.condition || null,
    accessionNumber: d.accessionNumber || null,
    provenance: d.provenance || null,
    // Preserve raw data for editor
    _raw: d,
  };
}
