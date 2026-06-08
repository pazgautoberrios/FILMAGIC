import { create } from 'zustand';
import type { ScanResult, ScannerStatus } from '@/types';

interface ScannerState {
  status: ScannerStatus;
  lastResult: ScanResult | null;
  isOffline: boolean;
  activeEventId: string | null;
  setStatus: (status: ScannerStatus) => void;
  setLastResult: (result: ScanResult | null) => void;
  setOffline: (offline: boolean) => void;
  setActiveEvent: (eventId: string | null) => void;
  reset: () => void;
}

export const useScannerStore = create<ScannerState>((set) => ({
  status: 'idle',
  lastResult: null,
  isOffline: false,
  activeEventId: null,
  setStatus: (status) => set({ status }),
  setLastResult: (lastResult) => set({ lastResult }),
  setOffline: (isOffline) => set({ isOffline }),
  setActiveEvent: (activeEventId) => set({ activeEventId }),
  reset: () => set({ status: 'idle', lastResult: null }),
}));
