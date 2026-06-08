import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { listEvents } from '@/services/firebase/events';
import { signOut } from '@/services/firebase/auth';
import { Badge } from '@/components/ui/Badge';
import { useCurrentUser, useIsAdmin } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import type { Event } from '@/types';

export default function EventsScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const isAdmin = useIsAdmin();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', user?.uid],
    queryFn: () => listEvents(user!.uid, user!.role),
    enabled: !!user,
  });

  async function handleSignOut() {
    await signOut();
    setUser(null);
  }

  function renderEvent({ item }: { item: Event }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(app)/dashboard/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.eventName}>{item.name}</Text>
          <Badge status={item.status} />
        </View>
        <Text style={styles.eventDate}>
          {format(item.date, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
        </Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <Text style={styles.guestCount}>{item.estimatedGuests} invitados estimados</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FILMAGIC</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#6B6B80" />
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/(app)/admin/events/create')}
        >
          <Ionicons name="add-circle" size={20} color="#6366F1" />
          <Text style={styles.createBtnText}>Crear Evento</Text>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <ActivityIndicator color="#6366F1" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay eventos asignados</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#6366F1', letterSpacing: 3 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginTop: 8 },
  createBtnText: { color: '#6366F1', fontSize: 15, fontWeight: '600' },
  list: { padding: 16, paddingTop: 8 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 16, padding: 18, marginBottom: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: { color: '#FFF', fontSize: 18, fontWeight: '700', flex: 1, marginRight: 8 },
  eventDate: {
    color: '#A0A0B0',
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  eventLocation: { color: '#6B6B80', fontSize: 13, marginBottom: 4 },
  guestCount: { color: '#6366F1', fontSize: 12, fontWeight: '500' },
  empty: { color: '#4A4A6A', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
