export const MOCK_EVENTS = [
  {
    id: 'evt-001',
    name: 'Avant Premiere — FILMAGIC',
    date: new Date('2025-08-15T20:00:00'),
    location: 'Cinépolis Palermo, Sala 1',
    estimatedGuests: 400,
    status: 'active' as const,
  },
  {
    id: 'evt-002',
    name: 'Preestreno VIP',
    date: new Date('2025-09-01T19:30:00'),
    location: 'Village Recoleta',
    estimatedGuests: 120,
    status: 'draft' as const,
  },
];

export const MOCK_GUESTS = [
  { id: 'g-001', eventId: 'evt-001', firstName: 'Laura', lastName: 'García', phone: '+54 11 4567-8901', email: 'laura@email.com', companions: 2, status: 'attended' as const, totalQRs: 3 },
  { id: 'g-002', eventId: 'evt-001', firstName: 'Martín', lastName: 'López', phone: '+54 11 5678-9012', companions: 0, status: 'confirmed' as const, totalQRs: 1 },
  { id: 'g-003', eventId: 'evt-001', firstName: 'Sofía', lastName: 'Martínez', phone: '+54 11 6789-0123', email: 'sofia@email.com', companions: 1, status: 'sent' as const, totalQRs: 2 },
  { id: 'g-004', eventId: 'evt-001', firstName: 'Diego', lastName: 'Fernández', phone: '+54 11 7890-1234', companions: 3, status: 'pending' as const, totalQRs: 4 },
  { id: 'g-005', eventId: 'evt-001', firstName: 'Valentina', lastName: 'Rodríguez', phone: '+54 11 8901-2345', companions: 0, status: 'absent' as const, totalQRs: 1 },
  { id: 'g-006', eventId: 'evt-001', firstName: 'Nicolás', lastName: 'González', phone: '+54 11 9012-3456', companions: 1, status: 'attended' as const, totalQRs: 2 },
];

export const MOCK_METRICS = {
  totalGuests: 400,
  totalQRs: 620,
  qrGenerated: 580,
  invitationsSent: 360,
  confirmed: 290,
  attended: 187,
  companions: 220,
  absent: 43,
  attendanceRate: 64,
};

// QR tokens válidos para demo del scanner
export const MOCK_VALID_TOKENS = [
  { token: 'VALID-QR-001', guestName: 'Laura García', qrIndex: 0, totalQRs: 3 },
  { token: 'VALID-QR-002', guestName: 'Laura García', qrIndex: 1, totalQRs: 3 },
  { token: 'VALID-QR-003', guestName: 'Martín López', qrIndex: 0, totalQRs: 1 },
];
