import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { QRModal } from './QRModal';
import type { Guest } from '@/types';

interface Props {
  guest: Guest;
  onPress: () => void;
}

export function GuestCard({ guest, onPress }: Props) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.info}>
          <Text style={styles.name}>
            {guest.lastName}, {guest.firstName}
          </Text>
          <Text style={styles.phone}>{guest.phone}</Text>
          {guest.companions > 0 && (
            <Text style={styles.companions}>
              +{guest.companions} acompañante{guest.companions > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.right}>
          <Badge status={guest.status} />
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => setShowQR(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="qr-code-outline" size={18} color="#6366F1" />
            <Text style={styles.qrCount}>{guest.totalQRs} QR</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <QRModal guest={guest} visible={showQR} onClose={() => setShowQR(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  phone: { color: '#A0A0B0', fontSize: 13, marginBottom: 2 },
  companions: { color: '#6366F1', fontSize: 12 },
  right: { alignItems: 'flex-end', gap: 6 },
  qrBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qrCount: { color: '#6B6B80', fontSize: 11 },
});
