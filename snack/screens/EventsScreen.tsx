import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../components/Badge';
import { AuthContext } from '../App';
import { MOCK_EVENTS } from '../data/mock';

export default function EventsScreen({ navigation }: any) {
  const { user, setUser } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FILMAGIC</Text>
        <View style={styles.headerRight}>
          <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
          <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#6B6B80" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={MOCK_EVENTS}
        keyExtractor={e => e.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.eventName}>{item.name}</Text>
              <Badge status={item.status} />
            </View>
            <Text style={styles.eventDate}>
              {item.date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · {item.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.eventLocation}>{item.location}</Text>
            <Text style={styles.guestCount}>{item.estimatedGuests} invitados estimados</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  logo: { fontSize: 22, fontWeight: '900', color: '#6366F1', letterSpacing: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  role: { color: '#6366F1', fontSize: 11, fontWeight: '700', backgroundColor: '#1E1E2E', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  logoutBtn: { padding: 4 },
  list: { padding: 16, paddingTop: 8 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 16, padding: 18, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  eventName: { color: '#FFF', fontSize: 17, fontWeight: '700', flex: 1, marginRight: 8 },
  eventDate: { color: '#A0A0B0', fontSize: 13, marginBottom: 4, textTransform: 'capitalize' },
  eventLocation: { color: '#6B6B80', fontSize: 13, marginBottom: 4 },
  guestCount: { color: '#6366F1', fontSize: 12, fontWeight: '500', marginTop: 4 },
});
