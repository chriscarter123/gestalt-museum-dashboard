// ── Venue Service ───────────────────────────────────────────────────────────
// Multi-tenant venue management: CRUD, membership, and migration.
// Supports one user → many venues AND many users → one venue.

import {
  doc, collection, addDoc, getDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, writeBatch, serverTimestamp, arrayUnion, arrayRemove,
  query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Venue CRUD ──────────────────────────────────────────────────────────────

/**
 * Create a new venue with the user as owner. Atomic batch:
 * 1. Create venues/{autoId}
 * 2. Create venues/{autoId}/members/{uid}
 * 3. Update users/{uid} with venues array entry + currentVenueId
 * Returns the new venue ID.
 */
export async function createVenue(venueData, ownerUid, ownerProfile) {
  const batch = writeBatch(db);

  // 1. Venue document
  const venueRef = doc(collection(db, 'venues'));
  const venueId = venueRef.id;

  const venueDoc = {
    name: venueData.name || '',
    type: venueData.type || '',
    tier: venueData.tier || 'starter',
    floorCount: venueData.floorCount || 1,
    artworkCount: venueData.artworkCount || 0,
    plan: venueData.plan || derivePlanFromTier(venueData.tier || 'starter'),
    onboardingComplete: true,
    createdBy: ownerUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.set(venueRef, venueDoc);

  // 2. Owner membership
  const memberRef = doc(db, 'venues', venueId, 'members', ownerUid);
  batch.set(memberRef, {
    uid: ownerUid,
    email: ownerProfile?.email || '',
    name: ownerProfile?.name || '',
    role: 'owner',
    joinedAt: serverTimestamp(),
  });

  // 3. Update user profile
  const userRef = doc(db, 'users', ownerUid);
  const venueEntry = { id: venueId, name: venueData.name || '', role: 'owner' };
  batch.update(userRef, {
    venues: arrayUnion(venueEntry),
    currentVenueId: venueId,
    onboardingComplete: true,
  });

  await batch.commit();
  return venueId;
}

/**
 * Subscribe to a venue document in real-time.
 */
export function subscribeToVenue(venueId, callback) {
  if (!venueId) { callback(null); return () => {}; }
  return onSnapshot(doc(db, 'venues', venueId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, (err) => {
    console.error('[venueService] Venue subscription error:', err);
    callback(null);
  });
}

/**
 * Update venue fields.
 */
export async function updateVenue(venueId, fields) {
  await updateDoc(doc(db, 'venues', venueId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Read the user's venues array.
 */
export async function getVenuesForUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data().venues || []) : [];
}

/**
 * Persist the user's current venue selection.
 */
export async function setCurrentVenue(uid, venueId) {
  await updateDoc(doc(db, 'users', uid), { currentVenueId: venueId });
}

// ── Membership ──────────────────────────────────────────────────────────────

/**
 * Add a member to a venue.
 */
export async function addMember(venueId, { uid, email, name, role = 'viewer' }) {
  await setDoc(doc(db, 'venues', venueId, 'members', uid), {
    uid, email, name, role,
    joinedAt: serverTimestamp(),
  });
}

/**
 * Remove a member from a venue.
 */
export async function removeMember(venueId, uid) {
  await deleteDoc(doc(db, 'venues', venueId, 'members', uid));
}

/**
 * Subscribe to a venue's members in real-time.
 */
export function subscribeToMembers(venueId, callback) {
  if (!venueId) { callback([]); return () => {}; }
  const q = query(collection(db, 'venues', venueId, 'members'), orderBy('joinedAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('[venueService] Members subscription error:', err);
    callback([]);
  });
}

// ── Migration ───────────────────────────────────────────────────────────────

/**
 * Migrate a user with the old inline `venue` field to the new multi-tenant schema.
 * Uses uid as venueId so existing artworks (with venueId = uid) continue to work.
 */
export async function migrateInlineVenue(userProfile) {
  const uid = userProfile.uid;
  const oldVenue = userProfile.venue;
  if (!oldVenue) return null;

  const batch = writeBatch(db);

  // Create venues/{uid} (using uid as venueId for backward compat)
  const venueRef = doc(db, 'venues', uid);
  batch.set(venueRef, {
    name: oldVenue.name || '',
    type: oldVenue.type || '',
    tier: oldVenue.tier || 'starter',
    floorCount: oldVenue.floorCount || 1,
    artworkCount: 0,
    plan: derivePlanFromTier(oldVenue.tier || 'starter'),
    onboardingComplete: true,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Add owner membership
  const memberRef = doc(db, 'venues', uid, 'members', uid);
  batch.set(memberRef, {
    uid,
    email: userProfile.email || '',
    name: userProfile.name || '',
    role: 'owner',
    joinedAt: serverTimestamp(),
  });

  // Update user profile
  const venueEntry = { id: uid, name: oldVenue.name || '', role: 'owner' };
  const userRef = doc(db, 'users', uid);
  batch.update(userRef, {
    venues: [venueEntry],
    currentVenueId: uid,
  });

  await batch.commit();
  return uid;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function derivePlanFromTier(tier) {
  switch (tier) {
    case 'institution': return {
      artworkLimit: null, analyticsEnabled: true, grantReportsEnabled: true,
      exhibitionsEnabled: true, multiFloorEnabled: true, arAnchorsEnabled: true,
      customBrandingEnabled: true,
    };
    case 'gallery': return {
      artworkLimit: 50, analyticsEnabled: true, grantReportsEnabled: false,
      exhibitionsEnabled: true, multiFloorEnabled: false, arAnchorsEnabled: false,
      customBrandingEnabled: true,
    };
    default: return {
      artworkLimit: 5, analyticsEnabled: false, grantReportsEnabled: false,
      exhibitionsEnabled: false, multiFloorEnabled: false, arAnchorsEnabled: false,
      customBrandingEnabled: false,
    };
  }
}
