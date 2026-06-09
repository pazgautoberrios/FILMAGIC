import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: extra.firebaseAuthDomain ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: extra.firebaseProjectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: extra.firebaseStorageBucket ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.firebaseMessagingSenderId ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.firebaseAppId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (__DEV__ && !firebaseConfig.apiKey) {
  console.error('[Firebase] apiKey is undefined. Check your .env file and app.config.ts');
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// initializeAuth must be called once; getAuth() on hot reload (app already initialized).
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app);
}
export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

export default app;
