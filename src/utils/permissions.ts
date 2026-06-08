import type { UserRole } from '@/types';

export const PERMISSIONS: Record<string, UserRole[]> = {
  createEvent: ['admin'],
  manageUsers: ['admin'],
  loadGuests: ['admin', 'organizer'],
  generateQR: ['admin', 'organizer'],
  sendInvitations: ['admin', 'organizer'],
  scanQR: ['admin', 'organizer', 'hostess'],
  viewDashboard: ['admin', 'organizer', 'hostess', 'readonly'],
  exportReports: ['admin', 'organizer'],
  revokeQR: ['admin'],
};

export function hasPermission(role: UserRole, action: string): boolean {
  return PERMISSIONS[action]?.includes(role) ?? false;
}
