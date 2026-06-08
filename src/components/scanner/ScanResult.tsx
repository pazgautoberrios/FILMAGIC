import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import type { ScanResult as ScanResultType } from '@/types';

interface Props {
  result: ScanResultType;
  onReset: () => void;
}

export function ScanResultOverlay({ result, onReset }: Props) {
  const isValid = result.status === 'valid';
  const isUsed = result.status === 'already_used';
  const bgColor = isValid ? '#10B981' : '#EF4444';

  useEffect(() => {
    if (isValid) {
      Vibration.vibrate(200);
    } else {
      Vibration.vibrate([0, 200, 100, 200]);
    }
    const timer = setTimeout(onReset, 3000);
    return () => clearTimeout(timer);
  }, [isValid, onReset]);

  return (
    <View style={[styles.overlay, { backgroundColor: bgColor }]}>
      <Text style={styles.icon}>{isValid ? '✓' : '✗'}</Text>
      <Text style={styles.status}>
        {isValid ? 'ACCESO PERMITIDO' : isUsed ? 'QR YA UTILIZADO' : 'ACCESO DENEGADO'}
      </Text>
      {result.guest && (
        <Text style={styles.name}>
          {result.guest.firstName} {result.guest.lastName}
        </Text>
      )}
      {result.guest && result.totalQRs && result.totalQRs > 1 && (
        <Text style={styles.companion}>
          QR {(result.qrIndex ?? 0) + 1} de {result.totalQRs}
          {result.qrIndex === 0 ? ' (Titular)' : ' (Acompañante)'}
        </Text>
      )}
      {isUsed && result.scannedAt && (
        <Text style={styles.usedAt}>
          Escaneado: {new Date(result.scannedAt).toLocaleTimeString()}
        </Text>
      )}
      <Text style={styles.message}>{result.message}</Text>
      <Text style={styles.timer}>Reseteando en 3s...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: { fontSize: 80, color: '#FFF', marginBottom: 16 },
  status: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '600', color: '#FFF', textAlign: 'center', marginBottom: 8 },
  companion: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 8 },
  usedAt: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  message: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8 },
  timer: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 24 },
});
