import { doc, getDoc, setDoc } from 'firebase/firestore';

import { FIRESTORE_USERS_COLLECTION } from '@/constants/firebase-config';
import type { UserProfile } from '@/constants/user-profile';
import { firestoreDb } from '@/lib/firebase';

export type FirestoreUserProfile = UserProfile & {
  email: string;
  updatedAt: string;
};

function userDocRef(uid: string) {
  return doc(firestoreDb, FIRESTORE_USERS_COLLECTION, uid);
}

export function isProfileComplete(profile: UserProfile | null | undefined): profile is UserProfile {
  return (
    profile !== null &&
    profile !== undefined &&
    profile.teamName.trim().length > 0 &&
    profile.firstName.trim().length > 0 &&
    profile.yearLevel.trim().length > 0
  );
}

export async function loadFirestoreUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userDocRef(uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const profile: UserProfile = {
    teamName: String(data.teamName ?? ''),
    firstName: String(data.firstName ?? ''),
    yearLevel: data.yearLevel as UserProfile['yearLevel'],
  };

  return isProfileComplete(profile) ? profile : null;
}

export async function saveFirestoreUserProfile(
  uid: string,
  email: string,
  profile: UserProfile
): Promise<void> {
  const payload: FirestoreUserProfile = {
    ...profile,
    email,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(userDocRef(uid), payload, { merge: true });
}
