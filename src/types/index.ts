export type UserRole = 'admin' | 'organizer' | 'hostess' | 'readonly';

export type EventStatus = 'draft' | 'active' | 'closed';

export type GuestStatus = 'pending' | 'sent' | 'confirmed' | 'attended' | 'absent';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedEvents: string[];
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: Date;
  location: string;
  estimatedGuests: number;
  accessRules: AccessRules;
  status: EventStatus;
  createdBy: string;
  createdAt: Date;
  bannerUrl?: string;
}

export interface AccessRules {
  doorsOpenAt?: string;
  doorsCloseAt?: string;
  maxCompanionsPerGuest: number;
  allowLateEntry: boolean;
}

export interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  companions: number;
  status: GuestStatus;
  totalQRs: number;
  notes?: string;
  createdAt: Date;
}

export interface QRCode {
  id: string;
  eventId: string;
  guestId: string;
  qrIndex: number;
  token: string;
  used: boolean;
  scannedAt?: Date;
  scannedBy?: string;
  scanLocation?: { latitude: number; longitude: number };
  imageUrl?: string;
  createdAt: Date;
}

export interface ScanResult {
  success: boolean;
  status: 'valid' | 'already_used' | 'invalid' | 'wrong_event' | 'expired';
  guest?: Pick<Guest, 'firstName' | 'lastName' | 'companions'>;
  qrIndex?: number;
  totalQRs?: number;
  scannedAt?: Date;
  message: string;
}

export interface EventMetrics {
  totalGuests: number;
  totalQRs: number;
  qrGenerated: number;
  invitationsSent: number;
  confirmed: number;
  attended: number;
  companions: number;
  absent: number;
  attendanceRate: number;
}

export interface InvitationChannel {
  whatsapp: boolean;
  email: boolean;
}

export type ScannerStatus = 'idle' | 'scanning' | 'processing' | 'success' | 'error' | 'offline';
