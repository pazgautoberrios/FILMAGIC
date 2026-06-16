import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { ScanResult } from '@/types';

export async function validateQRLocally(
  token: string,
  scannerUid: string,
  eventId?: string,
): Promise<ScanResult> {
  // Find the QR document by token
  const qrQuery = query(collection(db, 'qr_codes'), where('token', '==', token));
  const qrSnap = await getDocs(qrQuery);

  if (qrSnap.empty) {
    return { success: false, status: 'invalid', message: 'QR no reconocido o inválido' };
  }

  const qrDoc = qrSnap.docs[0];
  const qrData = qrDoc.data();

  if (eventId && qrData.eventId !== eventId) {
    return { success: false, status: 'wrong_event', message: 'QR pertenece a otro evento' };
  }

  if (qrData.used) {
    const scannedAt = qrData.scannedAt?.toDate?.() ?? new Date();
    return {
      success: false,
      status: 'already_used',
      message: 'Este QR ya fue utilizado',
      scannedAt,
    };
  }

  // Atomic transaction: mark used and fetch guest info simultaneously
  const guestRef = doc(db, 'guests', qrData.guestId);
  let guestData: Record<string, any> | null = null;

  await runTransaction(db, async (tx) => {
    const qrRef = doc(db, 'qr_codes', qrDoc.id);
    const freshQR = await tx.get(qrRef);

    // Double-check inside transaction to prevent race conditions
    if (freshQR.data()?.used) {
      throw new Error('ALREADY_USED');
    }

    const guestSnap = await tx.get(guestRef);
    guestData = guestSnap.exists() ? guestSnap.data() : null;

    tx.update(qrRef, {
      used: true,
      scannedAt: serverTimestamp(),
      scannedBy: scannerUid,
    });

    // Mark guest as attended when their first QR is scanned
    if (guestData && guestData.status !== 'attended') {
      tx.update(guestRef, { status: 'attended' });
    }
  }).catch((err) => {
    if (err.message === 'ALREADY_USED') {
      throw Object.assign(new Error('ALREADY_USED'), { code: 'ALREADY_USED' });
    }
    throw err;
  });

  return {
    success: true,
    status: 'valid',
    message: '¡Acceso permitido!',
    guest: guestData
      ? {
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          companions: guestData.companions,
        }
      : undefined,
    qrIndex: qrData.qrIndex,
    totalQRs: guestData?.totalQRs,
  };
}
