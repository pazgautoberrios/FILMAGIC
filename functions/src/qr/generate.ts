import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

function getSecret(): string {
  const secret = process.env.QR_SECRET;
  if (!secret) throw new Error('QR_SECRET not configured');
  return secret;
}

export const generateQRCodes = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  const { eventId, guestId } = data as { eventId: string; guestId: string };
  const guestDoc = await db.collection('guests').doc(guestId).get();
  if (!guestDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Guest not found');
  }

  const guest = guestDoc.data()!;
  const totalQRs: number = guest.totalQRs;
  const batch = db.batch();
  const bucket = storage.bucket();

  for (let i = 0; i < totalQRs; i++) {
    const qrId = uuidv4();
    const nonce = uuidv4().replace(/-/g, '');
    const payload = { qrId, eventId, guestId, qrIndex: i, nonce };
    const token = jwt.sign(payload, getSecret(), { expiresIn: '30d', algorithm: 'HS256' });

    const pngBuffer = await QRCode.toBuffer(token, { type: 'png', width: 512, margin: 2 });
    const file = bucket.file(`qr/${eventId}/${guestId}/${qrId}.png`);
    await file.save(pngBuffer, { contentType: 'image/png', public: true });
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/qr/${eventId}/${guestId}/${qrId}.png`;

    const ref = db.collection('qr_codes').doc(qrId);
    batch.set(ref, {
      id: qrId,
      eventId,
      guestId,
      qrIndex: i,
      token,
      used: false,
      scannedAt: null,
      scannedBy: null,
      imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  await db.collection('guests').doc(guestId).update({ status: 'pending' });
  return { generated: totalQRs };
});

export const generateAllQRsForEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }
  const { eventId } = data as { eventId: string };
  const guestsSnap = await db.collection('guests').where('eventId', '==', eventId).get();

  let generated = 0;
  let failed = 0;

  for (const guestDoc of guestsSnap.docs) {
    try {
      const guest = guestDoc.data();
      const totalQRs: number = guest.totalQRs;
      const batch = db.batch();
      const bucket = storage.bucket();

      for (let i = 0; i < totalQRs; i++) {
        const qrId = uuidv4();
        const nonce = uuidv4().replace(/-/g, '');
        const payload = { qrId, eventId, guestId: guestDoc.id, qrIndex: i, nonce };
        const token = jwt.sign(payload, getSecret(), { expiresIn: '30d', algorithm: 'HS256' });

        const pngBuffer = await QRCode.toBuffer(token, { type: 'png', width: 512, margin: 2 });
        const file = bucket.file(`qr/${eventId}/${guestDoc.id}/${qrId}.png`);
        await file.save(pngBuffer, { contentType: 'image/png', public: true });
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/qr/${eventId}/${guestDoc.id}/${qrId}.png`;

        const ref = db.collection('qr_codes').doc(qrId);
        batch.set(ref, {
          id: qrId, eventId, guestId: guestDoc.id, qrIndex: i, token,
          used: false, scannedAt: null, scannedBy: null,
          imageUrl, createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      generated += totalQRs;
    } catch {
      failed++;
    }
  }

  return { total: guestsSnap.size, generated, failed };
});
