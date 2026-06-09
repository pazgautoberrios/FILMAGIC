import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createEvent } from '@/services/firebase/events';
import { useCurrentUser } from '@/hooks/useAuth';

export default function CreateEventScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useCurrentUser();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedGuests, setEstimatedGuests] = useState('');
  const [loading, setLoading] = useState(false);

  function parseDateTime(): Date | null {
    const dateRe = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const timeRe = /^(\d{1,2}):(\d{2})$/;
    const dm = date.trim().match(dateRe);
    const tm = time.trim().match(timeRe);
    if (!dm || !tm) return null;
    const d = new Date(
      parseInt(dm[3]),
      parseInt(dm[2]) - 1,
      parseInt(dm[1]),
      parseInt(tm[1]),
      parseInt(tm[2]),
    );
    return isNaN(d.getTime()) ? null : d;
  }

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Error', 'El nombre del evento es requerido.');
    const eventDate = parseDateTime();
    if (!eventDate) return Alert.alert('Error', 'Formato de fecha u hora inválido.\nFecha: DD/MM/AAAA · Hora: HH:MM');
    if (!location.trim()) return Alert.alert('Error', 'La ubicación es requerida.');
    const guests = parseInt(estimatedGuests);
    if (!guests || guests < 1) return Alert.alert('Error', 'Ingresá una cantidad válida de invitados.');

    setLoading(true);
    try {
      await createEvent({
        name: name.trim(),
        date: eventDate,
        location: location.trim(),
        estimatedGuests: guests,
        status: 'draft',
        createdBy: user!.uid,
        accessRules: {
          maxCompanionsPerGuest: 1,
          allowLateEntry: true,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', __DEV__ ? err?.message : 'No se pudo crear el evento. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo Evento</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Field label="Nombre del evento">
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Avant Premiere — Película X"
              placeholderTextColor="#4A4A6A"
              maxLength={80}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Fecha">
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#4A4A6A"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Hora">
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#4A4A6A"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </Field>
            </View>
          </View>

          <Field label="Ubicación">
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Ej: Cine Hoyts, Abasto — Buenos Aires"
              placeholderTextColor="#4A4A6A"
            />
          </Field>

          <Field label="Invitados estimados">
            <TextInput
              style={styles.input}
              value={estimatedGuests}
              onChangeText={setEstimatedGuests}
              placeholder="Ej: 250"
              placeholderTextColor="#4A4A6A"
              keyboardType="number-pad"
              maxLength={5}
            />
          </Field>

          <TouchableOpacity
            style={[styles.createBtn, loading && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.createBtnText}>
              {loading ? 'Creando...' : 'Crear Evento'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { color: '#A0A0B0', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  title: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  form: { padding: 20 },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  createBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
