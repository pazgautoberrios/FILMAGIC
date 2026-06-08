import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { addGuest } from '@/services/firebase/guests';
import { useCurrentUser } from '@/hooks/useAuth';

export default function AddGuestScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useCurrentUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companions, setCompanions] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalQRs = parseInt(companions || '0', 10) + 1;

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      Alert.alert('Error', 'Nombre, apellido y teléfono son requeridos');
      return;
    }
    const companionsNum = parseInt(companions || '0', 10);
    if (isNaN(companionsNum) || companionsNum < 0) {
      Alert.alert('Error', 'Cantidad de acompañantes inválida');
      return;
    }

    setLoading(true);
    try {
      await addGuest({
        eventId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        companions: companionsNum,
        status: 'pending',
        notes: notes.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['guests', eventId] });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo agregar el invitado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Invitado</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Juan"
          placeholderTextColor="#4A4A6A"
        />

        <Text style={styles.label}>Apellido *</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Pérez"
          placeholderTextColor="#4A4A6A"
        />

        <Text style={styles.label}>Teléfono (WhatsApp) *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+54 11 1234-5678"
          placeholderTextColor="#4A4A6A"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email (opcional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="juan@email.com"
          placeholderTextColor="#4A4A6A"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Acompañantes</Text>
        <TextInput
          style={styles.input}
          value={companions}
          onChangeText={setCompanions}
          placeholder="0"
          placeholderTextColor="#4A4A6A"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="VIP, prensa, etc."
          placeholderTextColor="#4A4A6A"
          multiline
          numberOfLines={3}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Se generarán <Text style={styles.summaryHighlight}>{totalQRs} QR</Text>
            {' '}(1 titular{parseInt(companions || '0', 10) > 0 ? ` + ${companions} acompañante${parseInt(companions || '0', 10) > 1 ? 's' : ''}` : ''})
          </Text>
        </View>

        <Button title="Guardar Invitado" onPress={handleSave} loading={loading} style={styles.button} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 8,
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  form: { padding: 20, gap: 4 },
  label: { color: '#A0A0B0', fontSize: 13, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  summary: {
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  summaryText: { color: '#A0A0B0', fontSize: 14, textAlign: 'center' },
  summaryHighlight: { color: '#6366F1', fontWeight: '700' },
  button: { marginTop: 24 },
});
