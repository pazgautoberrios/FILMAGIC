import { collection, doc, writeBatch, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './config';

function makeToken(eventId: string, guestId: string, qrIndex: number): string {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const payload = JSON.stringify({ eventId, guestId, qrIndex, nonce });
  // btoa is available in React Native (Hermes) and produces a stable base64 string
  return btoa(payload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
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

  await batch.commit();

  await updateDoc(doc(db, 'guests', guestId), { status: 'sent' });
}
