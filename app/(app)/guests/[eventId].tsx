import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { listGuests } from '@/services/firebase/guests';
import { GuestCard } from '@/components/guests/GuestCard';
import type { Guest, GuestStatus } from '@/types';

const FILTERS: { label: string; value: GuestStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Enviado', value: 'sent' },
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'Asistió', value: 'attended' },
  { label: 'No asistió', value: 'absent' },
];

export default function GuestsScreen() {
  const params = useLocalSearchParams<{ eventId: string }>();
  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GuestStatus | 'all'>('all');

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['guests', eventId],
    queryFn: () => listGuests(eventId),
    enabled: !!eventId,
  });

  const filtered = guests.filter((g) => {
    const matchesSearch =
      search.trim() === '' ||
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search);
    const matchesFilter = filter === 'all' || g.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          Invitados{guests.length > 0 ? ` (${guests.length})` : ''}
        </Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(app)/guests/add', params: { eventId } })}
        >
          <Ionicons name="person-add" size={22} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Buscar por nombre o teléfono..."
        placeholderTextColor="#4A4A6A"
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List — needs flex:1 wrapper so FlatList gets remaining height */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator color="#6366F1" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(g) => g.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }: { item: Guest }) => (
              <GuestCard
                guest={item}
                onPress={() => {}}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {guests.length === 0
                  ? 'No hay invitados aún. Tocá + para agregar.'
                  : 'No se encontraron invitados con ese filtro.'}
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  backBtn: { width: 32 },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  search: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  filters: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1E1E2E',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  filterActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterText: { color: '#A0A0B0', fontSize: 13 },
  filterTextActive: { color: '#FFF', fontWeight: '600' },
  listContainer: { flex: 1 },
  listContent: { padding: 16, paddingTop: 8, flexGrow: 1 },
  empty: { color: '#4A4A6A', textAlign: 'center', marginTop: 48, fontSize: 15, lineHeight: 22 },
});
