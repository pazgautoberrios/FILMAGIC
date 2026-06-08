import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { ScanResultOverlay } from '@/components/scanner/ScanResult';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { validateQR } from '@/services/firebase/qr';
import type { ScanResult } from '@/types';

export default function ScannerScreen() {
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
        const scanResult = await validateQR(data);
        setResult(scanResult);
      } catch {
        setResult({
          success: false,
          status: 'invalid',
          message: isConnected ? 'Error al validar QR' : 'Sin conexión — modo offline',
        });
      } finally {
        processing.current = false;
      }
    },
    [result, isConnected],
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
});
