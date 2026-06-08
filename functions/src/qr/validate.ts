import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

interface QRPayload {
  qrId: string;
  eventId: string;
  guestId: string;
  qrIndex: number;
  nonce: string;
}

export const validateQR = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  const { token, location } = data as {
    token: string;
    location?: { latitude: number; longitude: number };
  };

  const secret = process.env.QR_SECRET;
  if (!secret) throw new functions.https.HttpsError('internal', 'Server misconfigured');

  let payload: QRPayload;
  try {
    payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as QRPayload;
  } catch {
    return { success: false, status: 'invalid', message: 'QR Inválido' };
  }

  const qrRef = db.collection('qr_codes').doc(payload.qrId);

  return db.runTransaction(async (tx) => {
    const qrDoc = await tx.get(qrRef);
    if (!qrDoc.exists) {
      return { success: false, status: 'invalid', message: 'QR no encontrado' };
    }

    const qrData = qrDoc.data()!;

    if (qrData.used === true) {
      return {
        success: false,
        status: 'already_used',
        scannedAt: qrData.scannedAt?.toDate(),
        message: 'Este QR ya fue utilizado',
      };
    }

    const guestDoc = await tx.get(db.collection('guests').doc(payload.guestId));
    const guest = guestDoc.data();

    tx.update(qrRef, {
      used: true,
      scannedAt: admin.firestore.FieldValue.serverTimestamp(),
      scannedBy: context.auth!.uid,
      ...(location
        ? {
            scanLocation: new admin.firestore.GeoPoint(
              location.latitude,
              location.longitude,
            ),
          }
        : {}),
    });

    if (payload.qrIndex === 0) {
      tx.update(db.collection('guests').doc(payload.guestId), { status: 'attended' });
    }

    return {
      success: true,
      status: 'valid',
      guest: guest
        ? {
            firstName: guest.firstName,
            lastName: guest.lastName,
            companions: guest.companions,
          }
        : undefined,
      qrIndex: payload.qrIndex,
      totalQRs: guest?.totalQRs,
      message: 'Acceso Permitido',
    };
  });
});
