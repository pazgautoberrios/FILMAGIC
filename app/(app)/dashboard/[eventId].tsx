import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MetricCard } from '@/components/ui/MetricCard';
import { getEvent, getEventMetrics } from '@/services/firebase/events';

export default function DashboardScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const id = Array.isArray(eventId) ? eventId[0] : eventId;

  const { data: event } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics', id],
    queryFn: () => getEventMetrics(id),
    enabled: !!id,
    refetchInterval: 15_000,
  });

  if (isLoading) {
    return <ActivityIndicator color="#6366F1" style={{ flex: 1, marginTop: 80 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.eventName} numberOfLines={1}>{event?.name ?? 'Evento'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.actions}>
          <ActionButton
            icon="people"
            label="Invitados"
            onPress={() => router.push({ pathname: '/(app)/guests/[eventId]', params: { eventId: id } })}
          />
          <ActionButton
            icon="person-add"
            label="Agregar invitado"
            onPress={() => router.push({ pathname: '/(app)/guests/add', params: { eventId: id } })}
          />
          <ActionButton
            icon="qr-code-outline"
            label="Escanear"
            onPress={() => router.push({ pathname: '/(app)/scanner/[eventId]', params: { eventId: id } })}
          />
        </View>

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

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={actionStyles.btn} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon as any} size={22} color="#6366F1" />
      <Text style={actionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const actionStyles = StyleSheet.create({
  btn: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  label: { color: '#A0A0B0', fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  backBtn: { width: 36 },
  eventName: { color: '#FFF', fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  scroll: { padding: 16 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
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

