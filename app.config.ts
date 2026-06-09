import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FILMAGIC',
  slug: 'filmagic',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0F',
  },
  sdkVersion: '54.0.0',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.filmagic.app',
    infoPlist: {
      NSCameraUsageDescription: 'FILMAGIC necesita acceso a la cámara para escanear códigos QR',
      NSLocationWhenInUseUsageDescription: 'FILMAGIC registra la ubicación del escaneo para auditoría',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0A0F',
    },
    package: 'com.filmagic.app',
    permissions: ['CAMERA', 'ACCESS_FINE_LOCATION', 'VIBRATE'],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-camera',
    'expo-secure-store',
    ['expo-av', { microphonePermission: false }],
  ],
  scheme: 'filmagic',
  extra: {
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    functionsUrl: process.env.EXPO_PUBLIC_FUNCTIONS_URL,
  },
});
