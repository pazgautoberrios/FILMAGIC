import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { listQRsForGuest } from '@/services/firebase/qr';
import { generateQRCodesLocally } from '@/services/firebase/qr.local';
import type { Guest, QRCode as QRCodeType } from '@/types';

interface Props {
  guest: Guest;
  visible: boolean;
  onClose: () => void;
}

export function QRModal({ guest, visible, onClose }: Props) {
  const [qrs, setQrs] = useState<QRCodeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchQRs = useCallback(() => {
    setLoading(true);
    listQRsForGuest(guest.id)
      .then((data) => setQrs(data.sort((a, b) => a.qrIndex - b.qrIndex)))
      .catch((err) => Alert.alert('Error', __DEV__ ? String(err) : 'No se pudieron cargar los QR'))
      .finally(() => setLoading(false));
  }, [guest.id]);

  useEffect(() => {
    if (!visible) return;
    fetchQRs();
  }, [visible, fetchQRs]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateQRCodesLocally(guest.eventId, guest.id, guest.totalQRs);
      fetchQRs();
    } catch (err: any) {
      Alert.alert('Error', __DEV__ ? (err?.message ?? String(err)) : 'No se pudieron generar los QR');
    } finally {
      setGenerating(false);
    }
  }

  function openWhatsApp() {
    const phone = guest.phone.replace(/\D/g, '');
    const name = `${guest.firstName} ${guest.lastName}`;
    const msg = encodeURIComponent(
      `Hola ${guest.firstName}! 🎬 Tu invitación para *${name}* está lista.\n` +
        `Tenés ${guest.totalQRs} código${guest.totalQRs > 1 ? 's' : ''} QR ` +
        `(1 titular${guest.companions > 0 ? ` + ${guest.companions} acompañante${guest.companions > 1 ? 's' : ''}` : ''}).\n` +
        `Mostrá los QR al ingresar al evento. 🎟️`,
    );
    const url = `whatsapp://send?phone=${phone}&text=${msg}`;
    Linking.canOpenURL(url).then((can) => {
      if (can) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'WhatsApp no disponible',
          'Instalá WhatsApp en el dispositivo para enviar el mensaje.',
        );
      }
    });
  }

  const labelFor = (index: number) =>
    index === 0 ? 'Titular' : `Acompañante ${index}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {guest.lastName}, {guest.firstName}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {guest.totalQRs} código{guest.totalQRs > 1 ? 's' : ''} QR · {guest.phone}
        </Text>

        {loading ? (
          <ActivityIndicator color="#6366F1" style={{ marginTop: 40 }} />
        ) : qrs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="qr-code-outline" size={48} color="#2A2A3E" />
            <Text style={styles.empty}>No hay QR generados aún</Text>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerate}
              disabled={generating}
              activeOpacity={0.8}
            >
              {generating ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color="#FFF" />
                  <Text style={styles.generateBtnText}>Generar {guest.totalQRs} QR</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.qrList}>
            {qrs.map((qr) => (
              <View key={qr.id} style={styles.qrCard}>
                <Text style={styles.qrLabel}>{labelFor(qr.qrIndex)}</Text>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={qr.token}
                    size={200}
                    backgroundColor="#0A0A0F"
                    color="#FFFFFF"
                  />
                </View>
                {qr.used && (
                  <View style={styles.usedBadge}>
                    <Text style={styles.usedText}>YA UTILIZADO</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp} activeOpacity={0.8}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
            <Text style={styles.whatsappText}>Enviar aviso por WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700', flex: 1, marginRight: 12 },
  subtitle: { color: '#6B6B80', fontSize: 13, paddingHorizontal: 20, paddingVertical: 10 },
  qrList: { padding: 20, gap: 24, alignItems: 'center' },
  qrCard: { alignItems: 'center', gap: 12 },
  qrLabel: { color: '#A0A0B0', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#0A0A0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  usedBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  usedText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  empty: { color: '#4A4A6A', textAlign: 'center', fontSize: 15 },
  generateBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  generateBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#1E1E2E' },
  whatsappBtn: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  whatsappText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
