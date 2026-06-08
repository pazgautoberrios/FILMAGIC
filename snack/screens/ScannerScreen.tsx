import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Vibration,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_VALID_TOKENS } from '../data/mock';

type ScanState = 'idle' | 'success' | 'used' | 'invalid';

const usedTokens = new Set<string>();

function validateToken(token: string): { state: ScanState; guestName?: string; qrIndex?: number; totalQRs?: number } {
  const found = MOCK_VALID_TOKENS.find(t => t.token === token.trim().toUpperCase());
  if (!found) return { state: 'invalid' };
  if (usedTokens.has(token.trim().toUpperCase())) return { state: 'used' };
  usedTokens.add(token.trim().toUpperCase());
  return { state: 'success', guestName: found.guestName, qrIndex: found.qrIndex, totalQRs: found.totalQRs };
}

export default function ScannerScreen() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [inputToken, setInputToken] = useState('');
  const [lastResult, setLastResult] = useState<ReturnType<typeof validateToken> | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScan = useCallback((token: string) => {
    if (scanState !== 'idle' || !token.trim()) return;
    const result = validateToken(token);
    setLastResult(result);
    setScanState(result.state);
    if (result.state === 'success') Vibration.vibrate(200);
    else Vibration.vibrate([0, 150, 80, 150]);
    timerRef.current = setTimeout(() => {
      setScanState('idle');
      setInputToken('');
    }, 3000);
  }, [scanState]);

  const bgColor = scanState === 'success' ? '#10B981' : scanState === 'idle' ? '#0A0A0F' : '#EF4444';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {scanState !== 'idle' ? (
        // Pantalla de resultado a pantalla completa
        <View style={styles.resultScreen}>
          <Text style={styles.resultIcon}>{scanState === 'success' ? '✓' : '✗'}</Text>
          <Text style={styles.resultTitle}>
            {scanState === 'success' ? 'ACCESO PERMITIDO'
              : scanState === 'used' ? 'QR YA UTILIZADO'
              : 'QR INVÁLIDO'}
          </Text>
          {lastResult?.guestName && (
            <Text style={styles.resultGuest}>{lastResult.guestName}</Text>
          )}
          {lastResult?.totalQRs && lastResult.totalQRs > 1 && (
            <Text style={styles.resultQrInfo}>
              QR {(lastResult.qrIndex ?? 0) + 1} de {lastResult.totalQRs}
              {lastResult.qrIndex === 0 ? ' · Titular' : ' · Acompañante'}
            </Text>
          )}
          <Text style={styles.resetHint}>Reseteando en 3s...</Text>
        </View>
      ) : (
        <SafeAreaView style={styles.idleContainer}>
          <View style={styles.scanHeader}>
            <Text style={styles.scanTitle}>Scanner QR</Text>
            <TouchableOpacity onPress={() => setShowSimulator(!showSimulator)}>
              <Ionicons name={showSimulator ? 'close-circle' : 'terminal'} size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {/* Frame de cámara simulado */}
          <View style={styles.cameraFrame}>
            <View style={styles.frameCornerTL} />
            <View style={styles.frameCornerTR} />
            <View style={styles.frameCornerBL} />
            <View style={styles.frameCornerBR} />
            <Ionicons name="qr-code-outline" size={80} color="rgba(99,102,241,0.3)" />
            <Text style={styles.cameraHint}>Apuntá la cámara al QR del invitado</Text>
          </View>

          {showSimulator && (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.simulator}>
                <Text style={styles.simTitle}>Simulador de QR</Text>
                <Text style={styles.simHint}>Tokens válidos de prueba:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tokensRow}>
                  {MOCK_VALID_TOKENS.map(t => (
                    <TouchableOpacity key={t.token} style={styles.tokenChip} onPress={() => handleScan(t.token)}>
                      <Text style={styles.tokenText}>{t.token}</Text>
                      <Text style={styles.tokenSub}>{t.guestName.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[styles.tokenChip, styles.invalidChip]} onPress={() => handleScan('TOKEN-FALSO-999')}>
                    <Text style={[styles.tokenText, { color: '#EF4444' }]}>INVÁLIDO</Text>
                    <Text style={styles.tokenSub}>Prueba error</Text>
                  </TouchableOpacity>
                </ScrollView>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.tokenInput}
                    value={inputToken}
                    onChangeText={setInputToken}
                    placeholder="Ingresá token manualmente..."
                    placeholderTextColor="#4A4A6A"
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.scanBtn} onPress={() => handleScan(inputToken)}>
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          )}
        </SafeAreaView>
      )}
    </View>
  );
}

const CORNER = { width: 28, height: 28, borderColor: '#6366F1', position: 'absolute' as const };

const styles = StyleSheet.create({
  container: { flex: 1 },
  resultScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultIcon: { fontSize: 90, color: '#FFF', marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12 },
  resultGuest: { fontSize: 24, fontWeight: '600', color: '#FFF', textAlign: 'center', marginBottom: 8 },
  resultQrInfo: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  resetHint: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 32 },
  idleContainer: { flex: 1 },
  scanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  scanTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  cameraFrame: {
    flex: 1, margin: 32, borderRadius: 16, backgroundColor: '#1A1A2E',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    borderWidth: 1, borderColor: '#1E1E2E',
  },
  frameCornerTL: { ...CORNER, top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  frameCornerTR: { ...CORNER, top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  frameCornerBL: { ...CORNER, bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  frameCornerBR: { ...CORNER, bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  cameraHint: { color: '#4A4A6A', fontSize: 13, marginTop: 16, textAlign: 'center', paddingHorizontal: 24 },
  simulator: { backgroundColor: '#1E1E2E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 16 },
  simTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  simHint: { color: '#6B6B80', fontSize: 12, marginBottom: 10 },
  tokensRow: { marginBottom: 12 },
  tokenChip: {
    backgroundColor: '#10B98120', borderRadius: 10, padding: 10,
    marginRight: 8, borderWidth: 1, borderColor: '#10B981', minWidth: 90, alignItems: 'center',
  },
  invalidChip: { backgroundColor: '#EF444420', borderColor: '#EF4444' },
  tokenText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  tokenSub: { color: '#6B7280', fontSize: 10, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: 8 },
  tokenInput: {
    flex: 1, backgroundColor: '#0A0A0F', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 11, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: '#2A2A3E',
  },
  scanBtn: { backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
});
