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

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName:        '',
    gender:          '',
    phoneNumber:     '',
    role:            'patient',
    password:        '',
    confirmPassword: '',
    patientType:     '',
    matricNumber:    '',
    department:      '',
    staffId:         '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validate = () => {
    const { fullName, gender, phoneNumber, role, password, confirmPassword, patientType, matricNumber, department, staffId } = formData;
    if (!fullName || !gender || !phoneNumber || !role || !password || !confirmPassword)
      return 'Please fill in all required fields.';
    if (password !== confirmPassword)
      return 'Passwords do not match.';
    if (password.length < 6)
      return 'Password must be at least 6 characters.';
    if (role === 'patient') {
      if (!patientType) return 'Please select a patient type.';
      if (patientType === 'student' && (!matricNumber || !department))
        return 'Please enter your matric number and department.';
      if (patientType === 'staff' && !staffId)
        return 'Please enter your staff ID.';
    }
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setLoading(true);
      // TODO: Replace with real API call
      // await axios.post('/auth/register', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => navigation.replace('Login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const genders    = ['Male', 'Female', 'Other'];
  const roles      = ['Patient'];
  const patientTypes = ['Student', 'Staff', 'External'];

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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏥</Text>
          </View>
          <Text style={styles.title}>Redeemer's University</Text>
          <Text style={styles.subtitle}>Health Centre</Text>
          <Text style={styles.appName}>Create your account</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Success message */}
          {success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                ✅ Registration successful! Redirecting to login...
              </Text>
            </View>
          )}

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John Doe"
            placeholderTextColor="#adb5bd"
            value={formData.fullName}
            onChangeText={v => update('fullName', v)}
          />

          {/* Gender */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            {genders.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, formData.gender === g.toLowerCase() && styles.chipActive]}
                onPress={() => update('gender', g.toLowerCase())}
              >
                <Text style={[styles.chipText, formData.gender === g.toLowerCase() && styles.chipTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 08012345678"
            placeholderTextColor="#adb5bd"
            value={formData.phoneNumber}
            onChangeText={v => update('phoneNumber', v)}
            keyboardType="phone-pad"
          />

          {/* Role — hardcoded to patient */}

          {/* Patient Type */}
          {formData.role === 'patient' && (
            <View style={styles.patientSection}>
              <Text style={styles.label}>Patient Type</Text>
              <View style={styles.chipRow}>
                {patientTypes.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, formData.patientType === t.toLowerCase() && styles.chipActive]}
                    onPress={() => update('patientType', t.toLowerCase())}
                  >
                    <Text style={[styles.chipText, formData.patientType === t.toLowerCase() && styles.chipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Student fields */}
              {formData.patientType === 'student' && (
                <>
                  <Text style={styles.label}>Matric Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. RUN/CMP/20/12236"
                    placeholderTextColor="#adb5bd"
                    value={formData.matricNumber}
                    onChangeText={v => update('matricNumber', v)}
                    autoCapitalize="characters"
                  />
                  <Text style={styles.label}>Department</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Computer Science"
                    placeholderTextColor="#adb5bd"
                    value={formData.department}
                    onChangeText={v => update('department', v)}
                  />
                </>
              )}

              {/* Staff fields */}
              {formData.patientType === 'staff' && (
                <>
                  <Text style={styles.label}>Staff ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. STF/2024/042"
                    placeholderTextColor="#adb5bd"
                    value={formData.staffId}
                    onChangeText={v => update('staffId', v)}
                    autoCapitalize="characters"
                  />
                </>
              )}
            </View>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor="#adb5bd"
            value={formData.password}
            onChangeText={v => update('password', v)}
            secureTextEntry
          />

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor="#adb5bd"
            value={formData.confirmPassword}
            onChangeText={v => update('confirmPassword', v)}
            secureTextEntry
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>

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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 24,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  logoCircle: {
    width: 65, height: 65,
    borderRadius: 32,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoEmoji: { fontSize: 28 },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  appName: {
    fontSize: 13,
    color: GOLD,
    fontWeight: '600',
    marginTop: 6,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    flex: 1,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  chipActive: {
    backgroundColor: MAROON,
    borderColor: MAROON,
  },
  chipText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Patient section
  patientSection: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  // Form
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#f8f9fa',
    marginBottom: 4,
  },

  // Feedback
  successBox: {
    backgroundColor: '#d1e7dd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#0f5132',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#842029',
    fontSize: 13,
  },

  // Button
  registerBtn: {
    backgroundColor: MAROON,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: MAROON,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loginText: {
    color: '#6c757d',
    fontSize: 13,
  },
  loginLink: {
    color: MAROON,
    fontSize: 13,
    fontWeight: '700',
  },
});