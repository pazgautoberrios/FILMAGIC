import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function MetricCard({ label, value, color = '#6366F1' }: { label: string; value: number | string; color?: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E', borderRadius: 12, padding: 16,
    alignItems: 'center', flex: 1, margin: 4,
  },
  value: { fontSize: 30, fontWeight: '800', marginBottom: 4 },
  label: { color: '#A0A0B0', fontSize: 12, textAlign: 'center' },
});
