import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AddGuestScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companions, setCompanions] = useState('0');
  const [saved, setSaved] = useState(false);

  const totalQRs = Math.max(0, parseInt(companions || '0', 10)) + 1;

  function handleSave() {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      Alert.alert('Error', 'Nombre, apellido y teléfono son requeridos');
      return;
    }
    setSaved(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (saved) {
    return (
      <View style={styles.successScreen}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successText}>Invitado guardado</Text>
        <Text style={styles.successSub}>
          {firstName} {lastName} · {totalQRs} QR {totalQRs > 1 ? 'generados' : 'generado'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Invitado</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView flex={1} behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form}>
          {[
            { label: 'Nombre *', value: firstName, onChange: setFirstName, placeholder: 'Juan' },
            { label: 'Apellido *', value: lastName, onChange: setLastName, placeholder: 'Pérez' },
            { label: 'Teléfono *', value: phone, onChange: setPhone, placeholder: '+54 11 1234-5678', keyboard: 'phone-pad' as const },
            { label: 'Email (opcional)', value: email, onChange: setEmail, placeholder: 'juan@email.com', keyboard: 'email-address' as const },
          ].map(f => (
            <View key={f.label}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input} value={f.value} onChangeText={f.onChange}
                placeholder={f.placeholder} placeholderTextColor="#4A4A6A"
                keyboardType={f.keyboard ?? 'default'}
                autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          <Text style={styles.label}>Acompañantes</Text>
          <View style={styles.companionsRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setCompanions(String(Math.max(0, parseInt(companions || '0', 10) - 1)))}
            >
              <Ionicons name="remove" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{companions}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setCompanions(String(parseInt(companions || '0', 10) + 1))}
            >
              <Ionicons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Se generarán{' '}
              <Text style={styles.summaryHighlight}>{totalQRs} QR</Text>
              {' '}— 1 titular{parseInt(companions || '0', 10) > 0
                ? ` + ${companions} acompañante${parseInt(companions || '0', 10) > 1 ? 's' : ''}`
                : ''}
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Guardar Invitado</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  form: { padding: 20, gap: 4 },
  label: { color: '#A0A0B0', fontSize: 13, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#1E1E2E', borderRadius: 10, paddingHorizontal: 16,
    paddingVertical: 13, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: '#2A2A3E',
  },
  companionsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  counterBtn: { backgroundColor: '#1E1E2E', borderRadius: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A3E' },
  counterValue: { color: '#FFF', fontSize: 22, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  summary: { backgroundColor: '#1E1E2E', borderRadius: 10, padding: 16, marginTop: 20, borderWidth: 1, borderColor: '#6366F1' },
  summaryText: { color: '#A0A0B0', fontSize: 14, textAlign: 'center' },
  summaryHighlight: { color: '#6366F1', fontWeight: '700' },
  button: { backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  successScreen: { flex: 1, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIcon: { fontSize: 80, color: '#FFF', marginBottom: 16 },
  successText: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  successSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
});
