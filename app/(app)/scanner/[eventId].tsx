import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { ScanResultOverlay } from '@/components/scanner/ScanResult';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { validateQRLocally } from '@/services/firebase/qr.validate';
import { useCurrentUser } from '@/hooks/useAuth';
import type { ScanResult } from '@/types';

export default function ScannerScreen() {
  const params = useLocalSearchParams<{ eventId: string }>();
  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
  const router = useRouter();
  const user = useCurrentUser();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const processing = useRef(false);
  const isConnected = useNetworkStatus();
  useKeepAwake();

  const handleBarCodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (processing.current || result) return;
      processing.current = true;

      try {
        const scanResult = await validateQRLocally(data, user?.uid ?? '', eventId);
        setResult(scanResult);
      } catch (err: any) {
        if (err?.code === 'ALREADY_USED') {
          setResult({ success: false, status: 'already_used', message: 'Este QR ya fue utilizado' });
        } else {
          setResult({
            success: false,
            status: 'invalid',
            message: isConnected ? 'Error al validar QR' : 'Sin conexión — modo offline',
          });
        }
      } finally {
        processing.current = false;
      }
    },
    [result, isConnected, eventId, user],
  );

  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>Se necesita acceso a la cámara</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir Cámara</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={result ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#FFF" />
      </TouchableOpacity>

      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color="#FFF" />
          <Text style={styles.offlineText}>MODO OFFLINE</Text>
        </View>
      )}

      {!result && (
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>Apuntá la cámara al código QR</Text>
        </View>
      )}

      {result && <ScanResultOverlay result={result} onReset={handleReset} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#6366F1',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: { color: 'rgba(255,255,255,0.7)', marginTop: 24, fontSize: 14 },
  offlineBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  offlineText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  permissionText: { color: '#FFF', textAlign: 'center', margin: 24, fontSize: 16 },
  permBtn: { backgroundColor: '#6366F1', margin: 24, padding: 16, borderRadius: 12 },
  permBtnText: { color: '#FFF', textAlign: 'center', fontWeight: '600' },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
