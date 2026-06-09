import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { AppUser } from '@/types';

export async function signIn(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = await fetchOrCreateUserProfile(credential.user);
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

async function fetchOrCreateUserProfile(firebaseUser: User): Promise<AppUser> {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: firebaseUser.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      assignedEvents: data.assignedEvents ?? [],
      createdAt: data.createdAt.toDate(),
    };
  }

  // First login: check if any user exists to determine role
  const existingUsers = await getDocs(query(collection(db, 'users'), limit(1)));
  const role = existingUsers.empty ? 'admin' : 'readonly';

  const now = new Date();
  const profile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Usuario',
    role,
    assignedEvents: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, profile);

  return {
    uid: firebaseUser.uid,
    email: profile.email,
    displayName: profile.displayName,
    role: profile.role as AppUser['role'],
    assignedEvents: [],
    createdAt: now,
  };
}

export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    assignedEvents: data.assignedEvents ?? [],
    createdAt: data.createdAt.toDate(),
  };
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
