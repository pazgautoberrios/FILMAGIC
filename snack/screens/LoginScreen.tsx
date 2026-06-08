import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../App';

// Credenciales demo
const DEMO_USERS = [
  { email: 'admin@filmagic.app', password: '123456', role: 'admin' as const, displayName: 'Admin FILMAGIC' },
  { email: 'anfitriona@filmagic.app', password: '123456', role: 'hostess' as const, displayName: 'Ana González' },
];

export default function LoginScreen() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simula latencia
    const found = DEMO_USERS.find(u => u.email === email.trim() && u.password === password);
    setLoading(false);
    if (found) {
      setUser({ uid: found.email, email: found.email, displayName: found.displayName, role: found.role });
    } else {
      Alert.alert('Error', 'Credenciales incorrectas.\n\nProbá con:\nadmin@filmagic.app / 123456\nanfitriona@filmagic.app / 123456');
    }
  }

  function fillDemo(type: 'admin' | 'hostess') {
    const u = DEMO_USERS.find(u => u.role === type)!;
    setEmail(u.email);
    setPassword(u.password);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>FILMAGIC</Text>
        <Text style={styles.subtitle}>Sistema de Acceso a Eventos</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input} value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address"
          placeholderTextColor="#4A4A6A" placeholder="tu@email.com"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input} value={password} onChangeText={setPassword}
          secureTextEntry placeholderTextColor="#4A4A6A" placeholder="••••••••"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin} disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.buttonText}>Ingresar</Text>}
        </TouchableOpacity>

        <View style={styles.demoRow}>
          <Text style={styles.demoLabel}>Acceso rápido demo:</Text>
          <TouchableOpacity style={styles.demoChip} onPress={() => fillDemo('admin')}>
            <Text style={styles.demoChipText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoChip} onPress={() => fillDemo('hostess')}>
            <Text style={styles.demoChipText}>Anfitriona</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  inner: { flex: 1, justifyContent: 'center', padding: 32 },
  logo: { fontSize: 40, fontWeight: '900', color: '#6366F1', textAlign: 'center', letterSpacing: 4, marginBottom: 8 },
  subtitle: { color: '#6B6B80', textAlign: 'center', marginBottom: 40, fontSize: 14 },
  label: { color: '#A0A0B0', fontSize: 13, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#1E1E2E', borderRadius: 10, paddingHorizontal: 16,
    paddingVertical: 14, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#2A2A3E',
  },
  button: {
    backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 28,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  demoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8, flexWrap: 'wrap' },
  demoLabel: { color: '#4A4A6A', fontSize: 12 },
  demoChip: { backgroundColor: '#1E1E2E', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#6366F1' },
  demoChipText: { color: '#6366F1', fontSize: 12, fontWeight: '600' },
});
