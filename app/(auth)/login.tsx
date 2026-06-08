import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { signIn } from '@/services/firebase/auth';
import { useAuthStore } from '@/store/auth.store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Ingresá email y contraseña');
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(email.trim(), password);
      setUser(user);
    } catch {
      Alert.alert('Error', 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>FILMAGIC</Text>
        <Text style={styles.subtitle}>Sistema de Acceso a Eventos</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholderTextColor="#4A4A6A"
            placeholder="tu@email.com"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#4A4A6A"
            placeholder="••••••••"
          />

          <Button title="Ingresar" onPress={handleLogin} loading={loading} style={styles.button} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  inner: { flex: 1, justifyContent: 'center', padding: 32 },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#6366F1',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: { color: '#6B6B80', textAlign: 'center', marginBottom: 48, fontSize: 14 },
  form: { gap: 8 },
  label: { color: '#A0A0B0', fontSize: 13, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  button: { marginTop: 24 },
});
