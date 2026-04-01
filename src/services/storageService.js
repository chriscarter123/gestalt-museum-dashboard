// ── Storage Service ─────────────────────────────────────────────────────────
// Uploads images to Firebase Storage via REST API.
// Uses the same bucket as the museum-ar-app visitor app.

import { auth } from '../firebase';

const STORAGE_BUCKET = 'gestalt-17ce0.firebasestorage.app';

/**
 * Upload a blob to Firebase Storage and return the public download URL.
 * @param {Blob} blob — file data
 * @param {string} path — storage path (e.g., 'artworks/uid/timestamp.jpg')
 * @returns {Promise<string>} — public download URL
 */
export async function uploadImage(blob, path) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in required to upload images.');

  const token = await user.getIdToken();
  const encodedPath = encodeURIComponent(path);

  const resp = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': blob.type || 'image/jpeg',
      },
      body: blob,
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Upload failed (${resp.status}): ${err?.error?.message ?? resp.statusText}`);
  }

  const result = await resp.json();
  const downloadToken = result.downloadTokens;
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media&token=${downloadToken}`;
}

/**
 * Upload an artwork image from a blob URL (as created by URL.createObjectURL).
 * Fetches the blob, uploads to Storage, returns the permanent download URL.
 * @param {string} blobUrl — local blob URL
 * @param {string} venueId — owner UID (used for path scoping)
 * @param {string} [filename] — optional filename hint
 * @returns {Promise<string>} — permanent Firebase Storage download URL
 */
export async function uploadArtworkImage(blobUrl, venueId, filename) {
  const resp = await fetch(blobUrl);
  const blob = await resp.blob();

  const ext = blob.type === 'image/png' ? 'png'
            : blob.type === 'image/webp' ? 'webp'
            : 'jpg';
  const name = filename || `img_${Date.now()}.${ext}`;
  const path = `artworks/${venueId}/${name}`;

  return uploadImage(blob, path);
}
