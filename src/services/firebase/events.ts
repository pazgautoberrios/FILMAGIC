import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Event, EventStatus, EventMetrics } from '@/types';

const COL = 'events';

function toEvent(id: string, data: Record<string, unknown>): Event {
  return {
    id,
    name: data.name as string,
    description: data.description as string | undefined,
    date: (data.date as Timestamp).toDate(),
    location: data.location as string,
    estimatedGuests: data.estimatedGuests as number,
    accessRules: data.accessRules as Event['accessRules'],
    status: data.status as EventStatus,
    createdBy: data.createdBy as string,
    createdAt: (data.createdAt as Timestamp).toDate(),
    bannerUrl: data.bannerUrl as string | undefined,
  };
}

export async function listEvents(userId: string, role: string): Promise<Event[]> {
  let q;
  if (role === 'admin') {
    q = query(collection(db, COL), orderBy('date', 'desc'));
  } else {
    q = query(
      collection(db, COL),
      where('assignedUsers', 'array-contains', userId),
      orderBy('date', 'desc'),
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getEvent(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return toEvent(snap.id, snap.data());
}

export async function createEvent(data: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    date: Timestamp.fromDate(data.date),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<void> {
  const payload: Record<string, unknown> = { ...data };
  if (data.date) payload.date = Timestamp.fromDate(data.date);
  await updateDoc(doc(db, COL, id), payload);
}

export async function getEventMetrics(eventId: string): Promise<EventMetrics> {
  const [guestsSnap, qrSnap] = await Promise.all([
    getDocs(query(collection(db, 'guests'), where('eventId', '==', eventId))),
    getDocs(query(collection(db, 'qr_codes'), where('eventId', '==', eventId))),
  ]);

  const guests = guestsSnap.docs.map((d) => d.data());
  const qrs = qrSnap.docs.map((d) => d.data());

  const attended = guests.filter((g) => g.status === 'attended').length;
  const confirmed = guests.filter((g) => ['confirmed', 'attended'].includes(g.status as string)).length;

  return {
    totalGuests: guests.length,
    totalQRs: guests.reduce((acc, g) => acc + (g.totalQRs as number ?? 1), 0),
    qrGenerated: qrs.length,
    invitationsSent: guests.filter((g) => ['sent', 'confirmed', 'attended'].includes(g.status as string)).length,
    confirmed,
    attended,
    companions: guests.reduce((acc, g) => acc + (g.companions as number ?? 0), 0),
    absent: guests.filter((g) => g.status === 'absent').length,
    attendanceRate: confirmed > 0 ? Math.round((attended / confirmed) * 100) : 0,
  };
}
