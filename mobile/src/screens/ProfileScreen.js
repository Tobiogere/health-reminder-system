import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const BG     = '#faf9f7';

export default function ProfileScreen({ navigation }) {
  const [user, setUser]         = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
      } catch (err) {
        console.error(err);
      }
    };
    loadUser();
  }, []);

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const patientTypeLabel = {
    student:  'Student',
    staff:    'Staff',
    external: 'External Patient',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'P'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {patientTypeLabel[user?.patientType] || 'Patient'}
            </Text>
          </View>
          <Text style={styles.identifier}>{user?.identifier || ''}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: 'info',     label: 'Personal Info' },
            { key: 'password', label: 'Change Password' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab.key);
                setError('');
                setSuccess('');
              }}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>

          {/* Personal Info Tab */}
          {activeTab === 'info' && (
            <View style={styles.infoCard}>
              {[
                { label: '👤 Full Name',    value: user?.name        || '—' },
                { label: '🎭 Role',         value: 'Patient'                },
                { label: '🏥 Patient Type', value: patientTypeLabel[user?.patientType] || '—' },
                { label: '🆔 Identifier',   value: user?.identifier  || '—' },
                { label: '🎓 Department',   value: user?.department  || '—' },
              ].map((item, i, arr) => (
                <View key={i}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <View>
              {success ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>✅ {success}</Text>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#adb5bd"
                value={passwordForm.currentPassword}
                onChangeText={v => {
                  setPasswordForm(p => ({ ...p, currentPassword: v }));
                  setError('');
                  setSuccess('');
                }}
                secureTextEntry
              />

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#adb5bd"
                value={passwordForm.newPassword}
                onChangeText={v => {
                  setPasswordForm(p => ({ ...p, newPassword: v }));
                  setError('');
                  setSuccess('');
                }}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat new password"
                placeholderTextColor="#adb5bd"
                value={passwordForm.confirmPassword}
                onChangeText={v => {
                  setPasswordForm(p => ({ ...p, confirmPassword: v }));
                  setError('');
                  setSuccess('');
                }}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: MAROON },
  header: {
    backgroundColor: MAROON,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },

  scroll: {
    flex: 1,
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: MAROON,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: GOLD,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: MAROON + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: MAROON,
  },
  identifier: {
    fontSize: 13,
    color: '#6c757d',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: MAROON,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
  },
  tabTextActive: {
    color: MAROON,
    fontWeight: '700',
  },

  section: { padding: 16 },

  // Info card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 13, color: '#6c757d', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#212529', fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },

  // Password form
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#fff',
    marginBottom: 4,
  },

  successBox: {
    backgroundColor: '#d1e7dd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: '#0f5132', fontSize: 13 },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: '#842029', fontSize: 13 },

  saveBtn: {
    backgroundColor: MAROON,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Logout
  logoutBtn: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  logoutText: { color: '#dc3545', fontWeight: '700', fontSize: 14 },
});