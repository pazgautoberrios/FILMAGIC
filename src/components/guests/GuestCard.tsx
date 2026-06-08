import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import type { Guest } from '@/types';

interface Props {
  guest: Guest;
  onPress: () => void;
}

export function GuestCard({ guest, onPress }: Props) {
  return (
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
        <Text style={styles.qrCount}>{guest.totalQRs} QR</Text>
      </View>
    </TouchableOpacity>
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
  qrCount: { color: '#6B6B80', fontSize: 11 },
});
