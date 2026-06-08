import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MetricCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  color?: string;
}

export function MetricCard({ label, value, subtitle, color = '#6366F1' }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    margin: 4,
  },
  value: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  label: { color: '#A0A0B0', fontSize: 12, textAlign: 'center' },
  subtitle: { color: '#6B6B80', fontSize: 11, marginTop: 2 },
});
