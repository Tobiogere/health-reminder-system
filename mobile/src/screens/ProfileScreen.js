import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Image,
  TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const API    = 'http://10.201.102.198:8000';

export default function ProfileScreen({ navigation }) {
  const { theme: t, toggleTheme } = useTheme();

  const [user, setUser]           = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading]     = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const [infoForm, setInfoForm] = useState({
    fullName: '', phone: '', caregiverName: '', caregiverEmail: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const loadUser = useCallback(async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      setInfoForm({
        fullName:       u.name           || '',
        phone:          u.phone          || '',
        caregiverName:  u.caregiverName  || '',
        caregiverEmail: u.caregiverEmail || '',
      });
      if (u.profilePicture) setProfilePic(u.profilePicture);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open image library.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const uploadProfilePicture = async (asset) => {
    try {
      setPicLoading(true);
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('profile_picture', {
        uri:  asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: 'profile.jpg',
      });
      const res = await fetch(`${API}/users/profile/picture`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfilePic(data.url);
        const updated = { ...user, profilePicture: data.url };
        await AsyncStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        setSuccess('Profile picture updated!');
      } else {
        Alert.alert('Error', data.message || 'Failed to upload picture.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not upload picture.');
    } finally {
      setPicLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Profile Picture', 'Choose an option', [
      { text: '📷 Take Photo',       onPress: handleTakePhoto },
      { text: '🖼️ Choose from Library', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUpdateInfo = async () => {
    if (!infoForm.fullName.trim()) { setError('Full name cannot be empty.'); return; }
    try {
      setLoading(true); setError(''); setSuccess('');
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/users/profile`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:       infoForm.fullName,
          phone:          infoForm.phone,
          caregiverName:  infoForm.caregiverName,
          caregiverEmail: infoForm.caregiverEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...user, name: infoForm.fullName, phone: infoForm.phone,
          caregiverName: infoForm.caregiverName, caregiverEmail: infoForm.caregiverEmail };
        await AsyncStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        setSuccess('Profile updated successfully!');
      } else { setError(data.message || 'Failed to update.'); }
    } catch { setError('Could not connect to server.'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) { setError('Fill in all fields.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Min 6 characters.'); return; }
    try {
      setLoading(true); setError(''); setSuccess('');
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/users/password`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else { setError(data.message || 'Failed to change password.'); }
    } catch { setError('Could not connect to server.'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['token', 'user']);
        navigation.replace('Login');
      }},
    ]);
  };

  const inp = {
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14,
    backgroundColor: t.input, borderColor: t.border, color: t.text, marginBottom: 4,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MAROON }}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          <TouchableOpacity onPress={showImageOptions} style={styles.avatarWrapper}>
            {picLoading ? (
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'P'}</Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Text style={{ fontSize: 14 }}>📷</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: t.text }]}>{user?.name || 'Patient'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user?.patientType ? user.patientType.charAt(0).toUpperCase() + user.patientType.slice(1) : 'Patient'}
            </Text>
          </View>
          <Text style={{ color: t.muted, fontSize: 13 }}>{user?.identifier}</Text>
          {user?.phone && <Text style={{ color: t.muted, fontSize: 13, marginTop: 2 }}>📞 {user.phone}</Text>}
          <Text style={{ color: t.muted, fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
            Tap photo to change
          </Text>

          {/* Dark mode toggle */}
          <View style={[styles.darkToggleRow, { borderTopColor: t.border }]}>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '600' }}>
              {t.dark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Text>
            <Switch value={t.dark} onValueChange={toggleTheme}
              trackColor={{ false: '#dee2e6', true: MAROON }}
              thumbColor={t.dark ? GOLD : '#fff'} />
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          {[{ key: 'info', label: 'Personal Info' }, { key: 'password', label: 'Change Password' }].map(tab => (
            <TouchableOpacity key={tab.key}
              style={[styles.tab, activeTab === tab.key && { borderBottomColor: MAROON, borderBottomWidth: 2 }]}
              onPress={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}>
              <Text style={{ fontSize: 13, fontWeight: activeTab === tab.key ? '700' : '600',
                color: activeTab === tab.key ? MAROON : t.muted }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          {success ? <View style={styles.successBox}><Text style={styles.successText}>✅ {success}</Text></View> : null}
          {error   ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {/* Personal Info Tab */}
          {activeTab === 'info' && (
            <View>
              <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }]}>
                {[
                  { label: '🆔 Identifier', value: user?.identifier || '—' },
                  { label: '🎓 Department', value: user?.department  || '—' },
                ].map((item, i, arr) => (
                  <View key={i}>
                    <View style={styles.infoRow}>
                      <Text style={{ color: t.muted, fontSize: 13 }}>{item.label}</Text>
                      <Text style={{ color: t.text, fontSize: 13, fontWeight: '700', maxWidth: '55%', textAlign: 'right' }}>{item.value}</Text>
                    </View>
                    {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: t.border }} />}
                  </View>
                ))}
              </View>

              <Text style={[styles.label, { color: t.text }]}>Full Name</Text>
              <TextInput style={inp} value={infoForm.fullName}
                onChangeText={v => { setInfoForm(p => ({ ...p, fullName: v })); setError(''); setSuccess(''); }} />

              <Text style={[styles.label, { color: t.text }]}>Phone Number</Text>
              <TextInput style={inp} value={infoForm.phone} keyboardType="phone-pad"
                placeholder="e.g. 08012345678" placeholderTextColor={t.muted}
                onChangeText={v => { setInfoForm(p => ({ ...p, phone: v })); setError(''); setSuccess(''); }} />

              <View style={[styles.caregiverBox, { backgroundColor: t.subBg, borderColor: t.border }]}>
                <Text style={{ color: t.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  👨‍👩‍👦 Caregiver Info
                </Text>
                <Text style={[styles.label, { color: t.text }]}>Caregiver Name</Text>
                <TextInput style={inp} value={infoForm.caregiverName}
                  placeholder="e.g. Mrs. Moradeyo (Mother)" placeholderTextColor={t.muted}
                  onChangeText={v => { setInfoForm(p => ({ ...p, caregiverName: v })); setError(''); setSuccess(''); }} />
                <Text style={[styles.label, { color: t.text }]}>Caregiver Email</Text>
                <TextInput style={inp} value={infoForm.caregiverEmail} keyboardType="email-address"
                  placeholder="e.g. parent@email.com" placeholderTextColor={t.muted}
                  onChangeText={v => { setInfoForm(p => ({ ...p, caregiverEmail: v })); setError(''); setSuccess(''); }} />
                <Text style={{ color: t.muted, fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>
                  They'll be emailed if you miss a dose.
                </Text>
              </View>

              <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleUpdateInfo} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>💾 Save Changes</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <View>
              {[
                { field: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                { field: 'newPassword',     label: 'New Password',     placeholder: 'Minimum 6 characters'  },
                { field: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat new password'   },
              ].map(({ field, label, placeholder }) => (
                <View key={field}>
                  <Text style={[styles.label, { color: t.text }]}>{label}</Text>
                  <TextInput style={inp} secureTextEntry placeholder={placeholder}
                    placeholderTextColor={t.muted} value={passwordForm[field]}
                    onChangeText={v => { setPasswordForm(p => ({ ...p, [field]: v })); setError(''); setSuccess(''); }} />
                </View>
              ))}
              <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleChangePassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>🔒 Change Password</Text>}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  avatarSection: { alignItems: 'center', paddingTop: 30, paddingBottom: 0, borderBottomWidth: 1 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: MAROON, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: GOLD },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: GOLD },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  roleBadge: { backgroundColor: MAROON + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginBottom: 6 },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: MAROON },
  darkToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 16, marginTop: 12, borderTopWidth: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  infoCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  caregiverBox: { borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 8, borderWidth: 1 },
  successBox: { backgroundColor: '#d1e7dd', borderRadius: 8, padding: 12, marginBottom: 12 },
  successText: { color: '#0f5132', fontSize: 13 },
  errorBox: { backgroundColor: '#f8d7da', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: '#842029', fontSize: 13 },
  saveBtn: { backgroundColor: MAROON, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: { marginTop: 16, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
  logoutText: { color: '#dc3545', fontWeight: '700', fontSize: 14 },
});