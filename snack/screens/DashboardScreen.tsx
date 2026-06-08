import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MetricCard } from '../components/MetricCard';
import { MOCK_METRICS } from '../data/mock';

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simula actualización en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        attended: Math.min(prev.attended + Math.floor(Math.random() * 3), prev.confirmed),
        attendanceRate: Math.min(prev.attendanceRate + Math.floor(Math.random() * 2), 100),
      }));
      setLastUpdate(new Date());
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Avant Premiere — FILMAGIC</Text>
        <Text style={styles.updated}>
          Actualizado: {lastUpdate.toLocaleTimeString('es-AR')} · en vivo
          <Text style={styles.dot}> ●</Text>
        </Text>

        <Text style={styles.section}>ASISTENCIA</Text>
        <View style={styles.row}>
          <MetricCard label="Ingresaron" value={metrics.attended} color="#10B981" />
          <MetricCard label="Confirmados" value={metrics.confirmed} color="#8B5CF6" />
          <MetricCard label="Tasa" value={`${metrics.attendanceRate}%`} color="#6366F1" />
        </View>

        <Text style={styles.section}>INVITADOS</Text>
        <View style={styles.row}>
          <MetricCard label="Total" value={metrics.totalGuests} color="#FFF" />
          <MetricCard label="Acompañantes" value={metrics.companions} color="#F59E0B" />
          <MetricCard label="No asistió" value={metrics.absent} color="#6B7280" />
        </View>

        <Text style={styles.section}>CÓDIGOS QR</Text>
        <View style={styles.row}>
          <MetricCard label="Generados" value={metrics.qrGenerated} color="#3B82F6" />
          <MetricCard label="Total QR" value={metrics.totalQRs} color="#FFF" />
          <MetricCard label="Enviados" value={metrics.invitationsSent} color="#10B981" />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso de asistencia</Text>
            <Text style={styles.progressPercent}>{metrics.attendanceRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${metrics.attendanceRate}%` }]} />
          </View>
          <Text style={styles.progressSub}>
            {metrics.attended} de {metrics.confirmed} confirmados ingresaron
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 16 },
  title: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  updated: { color: '#4A4A6A', fontSize: 12, marginBottom: 4 },
  dot: { color: '#10B981' },
  section: { color: '#4A4A6A', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginTop: 20, marginBottom: 8 },
  row: { flexDirection: 'row' },
  progressContainer: { backgroundColor: '#1E1E2E', borderRadius: 12, padding: 16, marginTop: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { color: '#A0A0B0', fontSize: 13 },
  progressPercent: { color: '#6366F1', fontWeight: '700', fontSize: 13 },
  progressBar: { height: 8, backgroundColor: '#2A2A3E', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 4 },
  progressSub: { color: '#6B7280', fontSize: 12, marginTop: 8 },
});
