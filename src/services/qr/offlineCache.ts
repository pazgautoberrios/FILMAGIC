import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'filmagic_qr_cache_';

export interface CachedToken {
  token: string;
  guestName: string;
  qrIndex: number;
  totalQRs: number;
}

export async function cacheEventTokens(eventId: string, tokens: CachedToken[]): Promise<void> {
  await AsyncStorage.setItem(KEY_PREFIX + eventId, JSON.stringify(tokens));
}

export async function getCachedToken(eventId: string, token: string): Promise<CachedToken | null> {
  const raw = await AsyncStorage.getItem(KEY_PREFIX + eventId);
  if (!raw) return null;
  const tokens: CachedToken[] = JSON.parse(raw);
  return tokens.find((t) => t.token === token) ?? null;
}

export async function markTokenUsedOffline(eventId: string, token: string): Promise<void> {
  const KEY_USED = `filmagic_used_offline_${eventId}`;
  const raw = await AsyncStorage.getItem(KEY_USED);
  const used: string[] = raw ? JSON.parse(raw) : [];
  if (!used.includes(token)) {
    used.push(token);
    await AsyncStorage.setItem(KEY_USED, JSON.stringify(used));
  }
}

export async function isTokenUsedOffline(eventId: string, token: string): Promise<boolean> {
  const KEY_USED = `filmagic_used_offline_${eventId}`;
  const raw = await AsyncStorage.getItem(KEY_USED);
  const used: string[] = raw ? JSON.parse(raw) : [];
  return used.includes(token);
}

export async function clearEventCache(eventId: string): Promise<void> {
  await AsyncStorage.multiRemove([KEY_PREFIX + eventId, `filmagic_used_offline_${eventId}`]);
}
