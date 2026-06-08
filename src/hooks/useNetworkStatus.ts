import { useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { useScannerStore } from '@/store/scanner.store';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const setOffline = useScannerStore((s) => s.setOffline);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function check() {
      const state = await Network.getNetworkStateAsync();
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      setOffline(!connected);
    }

    check();
    interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [setOffline]);

  return isConnected;
}
