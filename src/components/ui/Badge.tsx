import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { GuestStatus, EventStatus } from '@/types';

const STATUS_COLORS: Record<GuestStatus | EventStatus, string> = {
  pending: '#F59E0B',
  sent: '#3B82F6',
  confirmed: '#8B5CF6',
  attended: '#10B981',
  absent: '#6B7280',
  draft: '#6B7280',
  active: '#10B981',
  closed: '#EF4444',
};

const STATUS_LABELS: Record<GuestStatus | EventStatus, string> = {
  pending: 'Pendiente',
  sent: 'Enviado',
  confirmed: 'Confirmado',
  attended: 'Asistió',
  absent: 'No asistió',
  draft: 'Borrador',
  active: 'Activo',
  closed: 'Cerrado',
};

interface BadgeProps {
  status: GuestStatus | EventStatus;
}

export function Badge({ status }: BadgeProps) {
  const color = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  text: { fontSize: 11, fontWeight: '600' },
});
