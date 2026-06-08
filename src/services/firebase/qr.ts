import { httpsCallable } from 'firebase/functions';
import { functions, db } from './config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { QRCode, ScanResult } from '@/types';

export async function generateQRCodes(eventId: string, guestId: string): Promise<void> {
  const fn = httpsCallable(functions, 'generateQRCodes');
  await fn({ eventId, guestId });
}

export async function generateAllQRsForEvent(eventId: string): Promise<void> {
  const fn = httpsCallable(functions, 'generateAllQRsForEvent');
  await fn({ eventId });
}

export async function validateQR(
  token: string,
  scannerLocation?: { latitude: number; longitude: number },
): Promise<ScanResult> {
  const fn = httpsCallable<
    { token: string; location?: { latitude: number; longitude: number } },
    ScanResult
  >(functions, 'validateQR');
  const result = await fn({ token, location: scannerLocation });
  return result.data;
}

export async function listQRsForGuest(guestId: string): Promise<QRCode[]> {
  const q = query(collection(db, 'qr_codes'), where('guestId', '==', guestId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      eventId: data.eventId,
      guestId: data.guestId,
      qrIndex: data.qrIndex,
      token: data.token,
      used: data.used,
      scannedAt: data.scannedAt ? (data.scannedAt as Timestamp).toDate() : undefined,
      scannedBy: data.scannedBy,
      imageUrl: data.imageUrl,
      createdAt: (data.createdAt as Timestamp).toDate(),
    } as QRCode;
  });
}

export async function sendInvitation(
  guestId: string,
  channels: { whatsapp: boolean; email: boolean },
): Promise<void> {
  const fn = httpsCallable(functions, 'sendInvitation');
  await fn({ guestId, channels });
}
