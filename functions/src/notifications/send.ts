import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

export const sendInvitation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  const { guestId, channels } = data as {
    guestId: string;
    channels: { whatsapp: boolean; email: boolean };
  };

  const [guestDoc, qrSnap] = await Promise.all([
    db.collection('guests').doc(guestId).get(),
    db.collection('qr_codes').where('guestId', '==', guestId).orderBy('qrIndex').get(),
  ]);

  if (!guestDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Guest not found');
  }

  const guest = guestDoc.data()!;
  const eventDoc = await db.collection('events').doc(guest.eventId).get();
  const event = eventDoc.data()!;
  const qrImageUrls: string[] = qrSnap.docs.map((d) => d.data().imageUrl as string);

  if (channels.email && guest.email) {
    const sgKey = process.env.SENDGRID_API_KEY;
    if (sgKey) {
      sgMail.setApiKey(sgKey);
      await sgMail.send({
        to: guest.email as string,
        from: (process.env.EMAIL_FROM as string) ?? 'noreply@filmagic.app',
        subject: `Tu invitación a ${event.name}`,
        html: buildEmailHTML(guest, event, qrImageUrls),
      });
    }
  }

  await db.collection('guests').doc(guestId).update({ status: 'sent' });
  return { sent: true };
});

function buildEmailHTML(
  guest: admin.firestore.DocumentData,
  event: admin.firestore.DocumentData,
  qrUrls: string[],
): string {
  const qrImages = qrUrls
    .map(
      (url, i) =>
        `<div style="margin:16px 0">
          <p style="color:#999;font-size:14px">QR ${i + 1}${i === 0 ? ' (Titular)' : ' (Acompañante)'}</p>
          <img src="${url}" width="200" style="border-radius:8px" />
        </div>`,
    )
    .join('');

  const eventDate = event.date?.toDate
    ? event.date.toDate().toLocaleDateString('es-AR', { dateStyle: 'full' })
    : '';

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#FFF;padding:32px;border-radius:16px">
      <h1 style="color:#6366F1;letter-spacing:4px;margin:0 0 8px">FILMAGIC</h1>
      <h2 style="margin:0 0 24px">¡Hola, ${guest.firstName}!</h2>
      <p>Estás invitado/a a <strong>${event.name}</strong>.</p>
      <p><strong>Fecha:</strong> ${eventDate}</p>
      <p><strong>Lugar:</strong> ${event.location}</p>
      <hr style="border:none;border-top:1px solid #1E1E2E;margin:24px 0" />
      <p>Presentá estos códigos QR en la entrada:</p>
      ${qrImages}
      <p style="color:#666;font-size:12px;margin-top:32px">
        Cada QR es de un solo uso. No compartas ni reenvíes esta invitación.
      </p>
    </div>
  `;
}
