// ── Submission Service ──────────────────────────────────────────────────────
// Real-time subscription + approve/reject actions for the `submissions`
// Firestore collection written by the museum-ar-app mobile contributor flow.

import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const SUBMISSIONS_COL = 'submissions';
const ARTWORKS_COL = 'artworks';

/**
 * Subscribe to all submissions, newest first.
 * Returns an unsubscribe function.
 */
export function subscribeToSubmissions(callback) {
  const q = query(
    collection(db, SUBMISSIONS_COL),
    orderBy('submitted_at', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const submissions = snapshot.docs.map(normalizeSubmission);
    callback(submissions);
  }, (err) => {
    console.error('[submissionService] Subscription error:', err.message);
    // Common cause: missing Firestore index. Log the index creation URL if present.
    callback([]);
  });
}

/**
 * Approve a submission — promotes it to the `artworks` collection
 * and marks the submission as approved.
 *
 * @param {string} submissionId
 * @param {object} submission   — normalized submission object
 * @param {string|null} venueId — venue to associate the artwork with
 * @param {string} uid          — reviewer's Firebase Auth UID
 * @returns {Promise<string>}   — new artwork document ID
 */
export async function approveSubmission(submissionId, submission, venueId, uid) {
  const artworkData = {
    title: submission.attribution?.title || 'Untitled',
    artist: submission.attribution?.artist || 'Unknown Artist',
    year: submission.attribution?.year || null,
    medium: submission.attribution?.medium || null,
    description: submission.attribution?.description || null,
    condition: submission.attribution?.condition || null,
    type: 'outdoor',
    status: 'active',
    images: submission.photo_url ? [submission.photo_url] : [],
    location: submission.location || null,
    compass_heading: submission.compass_heading || null,
    source: 'contributor',
    source_submission_id: submissionId,
    contributor_id: submission.contributor_id || null,
    contributor_email: submission.contributor_email || null,
    trust_score: submission.trust_score,
    venueId: venueId || null,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const artworkRef = await addDoc(collection(db, ARTWORKS_COL), artworkData);

  // Mark submission as approved, link to the new artwork doc
  await updateDoc(doc(db, SUBMISSIONS_COL, submissionId), {
    status: 'approved',
    artwork_id: artworkRef.id,
    reviewed_at: serverTimestamp(),
    reviewed_by: uid,
  });

  return artworkRef.id;
}

/**
 * Reject a submission — marks it rejected without promoting to artworks.
 */
export async function rejectSubmission(submissionId, uid) {
  await updateDoc(doc(db, SUBMISSIONS_COL, submissionId), {
    status: 'rejected',
    reviewed_at: serverTimestamp(),
    reviewed_by: uid,
  });
}

// ── Normalizer ──────────────────────────────────────────────────────────────

function normalizeSubmission(docSnap) {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    status: d.status || 'pending',
    photo_url: d.photo_url || null,
    location: d.location || null,
    compass_heading: typeof d.compass_heading === 'number' ? d.compass_heading : null,
    trust_score: typeof d.trust_score === 'number' ? d.trust_score : null,
    trust_breakdown: d.trust_breakdown || {},
    ai_classification: d.ai_classification || {},
    attribution: d.attribution || {},
    contributor_id: d.contributor_id || null,
    contributor_email: d.contributor_email || null,
    is_first_finder: d.is_first_finder || false,
    nearby_artwork_id: d.nearby_artwork_id || null,
    voice_transcript: d.voice_transcript || null,
    submitted_at: d.submitted_at || null,
    captured_at: d.captured_at || null,
  };
}
