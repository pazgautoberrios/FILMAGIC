import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MetricCard } from '@/components/ui/MetricCard';
import { getEvent, getEventMetrics } from '@/services/firebase/events';

export default function DashboardScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics', eventId],
    queryFn: () => getEventMetrics(eventId),
    enabled: !!eventId,
    refetchInterval: 15_000,
  });

  if (isLoading) {
    return <ActivityIndicator color="#6366F1" style={{ flex: 1, marginTop: 80 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eventName}>{event?.name ?? 'Evento'}</Text>

        <Text style={styles.sectionTitle}>ASISTENCIA</Text>
        <View style={styles.row}>
          <MetricCard label="Ingresaron" value={metrics?.attended ?? 0} color="#10B981" />
          <MetricCard label="Confirmados" value={metrics?.confirmed ?? 0} color="#8B5CF6" />
          <MetricCard label="Tasa" value={`${metrics?.attendanceRate ?? 0}%`} color="#6366F1" />
        </View>

        <Text style={styles.sectionTitle}>INVITADOS</Text>
        <View style={styles.row}>
          <MetricCard label="Total" value={metrics?.totalGuests ?? 0} color="#FFF" />
          <MetricCard label="Acompañantes" value={metrics?.companions ?? 0} color="#F59E0B" />
          <MetricCard label="No asistió" value={metrics?.absent ?? 0} color="#6B7280" />
        </View>

        <Text style={styles.sectionTitle}>QR</Text>
        <View style={styles.row}>
          <MetricCard label="Generados" value={metrics?.qrGenerated ?? 0} color="#3B82F6" />
          <MetricCard label="Total QR" value={metrics?.totalQRs ?? 0} color="#FFF" />
          <MetricCard label="Enviados" value={metrics?.invitationsSent ?? 0} color="#10B981" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 16 },
  eventName: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 20, marginTop: 8 },
  sectionTitle: {
    color: '#4A4A6A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 16,
  },
  row: { flexDirection: 'row', gap: 8 },
});
