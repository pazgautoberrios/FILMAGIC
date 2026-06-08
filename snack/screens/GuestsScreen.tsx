import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../components/Badge';
import { MOCK_GUESTS } from '../data/mock';

type Filter = 'all' | 'pending' | 'sent' | 'confirmed' | 'attended' | 'absent';
const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Enviado', value: 'sent' },
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'Asistió', value: 'attended' },
  { label: 'No asistió', value: 'absent' },
];

export default function GuestsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = MOCK_GUESTS.filter(g => {
    const matchSearch = search === '' ||
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search);
    return matchSearch && (filter === 'all' || g.status === filter);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invitados</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddGuest')}>
          <Ionicons name="person-add" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search} value={search} onChangeText={setSearch}
        placeholder="Buscar por nombre o teléfono..."
        placeholderTextColor="#4A4A6A"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={g => g.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No se encontraron invitados</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.name}>{item.lastName}, {item.firstName}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
              {item.companions > 0 && (
                <Text style={styles.companions}>
                  +{item.companions} acompañante{item.companions > 1 ? 's' : ''}
                </Text>
              )}
            </View>
            <View style={styles.cardRight}>
              <Badge status={item.status} />
              <Text style={styles.qrCount}>{item.totalQRs} QR</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  search: {
    margin: 16, marginTop: 8, backgroundColor: '#1E1E2E', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12, color: '#FFF', fontSize: 15,
    borderWidth: 1, borderColor: '#2A2A3E',
  },
  filters: { paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1E1E2E', borderWidth: 1, borderColor: '#2A2A3E' },
  chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipText: { color: '#A0A0B0', fontSize: 13 },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  list: { padding: 16, paddingTop: 4 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1 },
  name: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  phone: { color: '#A0A0B0', fontSize: 13, marginBottom: 2 },
  companions: { color: '#6366F1', fontSize: 12 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  qrCount: { color: '#6B6B80', fontSize: 11 },
  empty: { color: '#4A4A6A', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
