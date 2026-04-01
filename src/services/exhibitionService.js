// ── Exhibition Service ──────────────────────────────────────────────────────
// Firestore CRUD + real-time subscription for exhibitions.

import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'exhibitions';

/**
 * Subscribe to exhibitions for a venue. Returns unsubscribe function.
 */
export function subscribeToExhibitions(venueId, callback) {
  if (!venueId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where('venueId', '==', venueId),
    orderBy('startDate', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const exhibitions = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
    callback(exhibitions);
  }, (err) => {
    console.error('[exhibitionService] Subscription error:', err);
    callback([]);
  });
}

/**
 * Create a new exhibition.
 */
export async function createExhibition(data, venueId) {
  const { id, ...fields } = data; // strip any client-generated id
  const ref = await addDoc(collection(db, COLLECTION), {
    ...fields,
    venueId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update an existing exhibition.
 */
export async function updateExhibition(exhibitionId, fields) {
  const ref = doc(db, COLLECTION, exhibitionId);
  await updateDoc(ref, { ...fields, updatedAt: serverTimestamp() });
}

/**
 * Delete an exhibition.
 */
export async function deleteExhibition(exhibitionId) {
  const ref = doc(db, COLLECTION, exhibitionId);
  await deleteDoc(ref);
}
