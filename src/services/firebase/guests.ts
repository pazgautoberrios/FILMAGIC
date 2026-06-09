import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import type { Guest, GuestStatus } from '@/types';

const COL = 'guests';

function toGuest(id: string, data: Record<string, unknown>): Guest {
  return {
    id,
    eventId: data.eventId as string,
    firstName: data.firstName as string,
    lastName: data.lastName as string,
    phone: data.phone as string,
    email: data.email as string | undefined,
    companions: data.companions as number,
    status: data.status as GuestStatus,
    totalQRs: data.totalQRs as number,
    notes: data.notes as string | undefined,
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}

export async function listGuests(eventId: string): Promise<Guest[]> {
  // orderBy on a different field than where() requires a composite Firestore index.
  // Sort client-side to avoid that requirement.
  const q = query(collection(db, COL), where('eventId', '==', eventId));
  const snap = await getDocs(q);
  const guests = snap.docs.map((d) => toGuest(d.id, d.data()));
  return guests.sort((a, b) => a.lastName.localeCompare(b.lastName));
}

export async function addGuest(data: Omit<Guest, 'id' | 'createdAt' | 'totalQRs'>): Promise<string> {
  const totalQRs = data.companions + 1;
  const ref = await addDoc(collection(db, COL), {
    ...data,
    totalQRs,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function bulkAddGuests(guests: Omit<Guest, 'id' | 'createdAt' | 'totalQRs'>[]): Promise<void> {
  const batch = writeBatch(db);
  guests.forEach((g) => {
    const ref = doc(collection(db, COL));
    batch.set(ref, {
      ...g,
      totalQRs: g.companions + 1,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function updateGuestStatus(id: string, status: GuestStatus): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}
