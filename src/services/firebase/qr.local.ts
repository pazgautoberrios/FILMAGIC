import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

function makeToken(eventId: string, guestId: string, qrIndex: number): string {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const payload = JSON.stringify({ eventId, guestId, qrIndex, nonce });
  return btoa(unescape(encodeURIComponent(payload)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function generateQRCodesLocally(
  eventId: string,
  guestId: string,
  totalQRs: number,
): Promise<void> {
  const batch = writeBatch(db);

  for (let i = 0; i < totalQRs; i++) {
    const ref = doc(collection(db, 'qr_codes'));
    batch.set(ref, {
      eventId,
      guestId,
      qrIndex: i,
      token: makeToken(eventId, guestId, i),
      used: false,
      createdAt: serverTimestamp(),
    });
  }

  // Include the status update in the same batch — avoids a second round-trip
  // that could fail independently and leave QRs created but status stale.
  const guestRef = doc(db, 'guests', guestId);
  batch.update(guestRef, { status: 'sent' });

  await batch.commit();
}
