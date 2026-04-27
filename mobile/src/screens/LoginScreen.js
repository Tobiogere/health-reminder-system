import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // TODO: Replace with real API call
      // const res = await axios.post('/auth/login', {
      //   identifier,
      //   password,
      //   role: 'patient'
      // });
      // await AsyncStorage.setItem('token', res.data.token);
      // await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

      // Simulate login for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      await AsyncStorage.setItem('token', 'dummy-token');
      await AsyncStorage.setItem('user', JSON.stringify({
        name: 'Test Patient',
        role: 'patient',
        identifier,
      }));

      navigation.replace('Dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏥</Text>
          </View>
          <Text style={styles.title}>Redeemer's University</Text>
          <Text style={styles.subtitle}>Health Centre</Text>
          <Text style={styles.appName}>RUN Med Reminder</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome!</Text>
          <Text style={styles.cardSubtitle}>
            Sign in to manage your medications
          </Text>

          {/* Identifier */}
          <Text style={styles.label}>Matric No / Staff ID / Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. STU/2024/001 or 08012345678"
            placeholderTextColor="#adb5bd"
            value={identifier}
            onChangeText={v => { setIdentifier(v); setError(''); }}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            External patients: enter your phone number
          </Text>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#adb5bd"
            value={password}
            onChangeText={v => { setPassword(v); setError(''); }}
            secureTextEntry
          />

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>

          {/* Info note
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🔒 This app is for patients only. Doctors and pharmacists
              should use the web portal.
            </Text>
          </View> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: MAROON,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 30,
  },
  logoCircle: {
    width: 75, height: 75,
    borderRadius: 37.5,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: { fontSize: 34 },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
  },
  appName: {
    fontSize: 12,
    fontWeight: '700',
    color: GOLD,
    marginTop: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 28,
    flex: 1,
    minHeight: 520,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MAROON,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 28,
    lineHeight: 20,
  },

  // Form
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#f8f9fa',
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic',
  },

  // Error
  errorBox: {
    backgroundColor: '#f8d7da',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  errorText: {
    color: '#842029',
    fontSize: 13,
    lineHeight: 18,
  },

  // Button
  loginBtn: {
    backgroundColor: MAROON,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: MAROON,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#6c757d',
    fontSize: 13,
  },
  registerLink: {
    color: MAROON,
    fontSize: 13,
    fontWeight: '700',
  },

  // Info box
  infoBox: {
    marginTop: 24,
    padding: 14,
    backgroundColor: '#fff8e8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
    textAlign: 'center',
  },
});