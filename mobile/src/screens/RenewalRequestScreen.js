import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const MAROON = '#6B0F1A';
const API    = 'http://10.201.102.198:8000';

export default function RenewalRequestScreen({ navigation }) {
  const { theme: t } = useTheme();
  const [user, setUser]               = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [renewals, setRenewals]       = useState([]);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [note, setNote]               = useState('');
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  const load = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token    = await AsyncStorage.getItem('token');
      if (!userData || !token) return;
      const u = JSON.parse(userData);
      setUser(u);
      const [prescRes, renewRes] = await Promise.all([
        fetch(`${API}/patients/${u.id}/prescriptions`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/renewals/`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const prescData = await prescRes.json();
      const renewData = await renewRes.json();
      if (prescRes.ok && Array.isArray(prescData)) {
        const active = prescData.filter(p => p.status === 'active');
        setPrescriptions(active);
        if (active.length > 0) setSelectedDrug(active[0].medicationName);
      }
      if (renewRes.ok && Array.isArray(renewData)) {
        setRenewals(renewData.filter(r => r.patientId === u.identifier || r.patientId === String(u.id)));
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!selectedDrug) { Alert.alert('Error', 'Please select a drug.'); return; }
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/patients/${user.id}/renewals`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName: selectedDrug, note }),
      });
      const data = await res.json();
      if (res.ok) { Alert.alert('Success', 'Renewal request submitted!'); setNote(''); load(); }
      else Alert.alert('Error', data.message || 'Failed.');
    } catch { Alert.alert('Error', 'Could not connect.'); }
    finally { setSubmitting(false); }
  };

  const statusColor = (s) => s === 'approved' ? { bg: '#d1e7dd', text: '#0f5132' }
    : s === 'rejected' ? { bg: '#f8d7da', text: '#842029' } : { bg: '#fff3cd', text: '#856404' };

  const inp = { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14,
    backgroundColor: t.input, borderColor: t.border, color: t.text, marginBottom: 4 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MAROON }}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Request Renewal</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={MAROON} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[MAROON]} />}>

          <View style={{ padding: 16, marginBottom: 4 }}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>🔄 New Renewal Request</Text>
            <View style={[styles.formCard, { backgroundColor: t.card, borderColor: t.border }]}>
              <Text style={[styles.label, { color: t.text }]}>Select Drug to Renew</Text>
              {prescriptions.length === 0
                ? <Text style={{ color: t.muted, fontSize: 13, fontStyle: 'italic' }}>No active prescriptions.</Text>
                : prescriptions.map(p => (
                  <TouchableOpacity key={p.id}
                    style={[styles.drugChip, { borderColor: t.border, backgroundColor: t.input },
                      selectedDrug === p.medicationName && { backgroundColor: MAROON, borderColor: MAROON }]}
                    onPress={() => setSelectedDrug(p.medicationName)}>
                    <Text style={[styles.drugChipText, { color: selectedDrug === p.medicationName ? '#fff' : t.text }]}>
                      💊 {p.medicationName}
                    </Text>
                    {selectedDrug === p.medicationName && <Text style={{ color: '#fff' }}>✓</Text>}
                  </TouchableOpacity>
                ))
              }
              <Text style={[styles.label, { color: t.text, marginTop: 16 }]}>Additional Note (optional)</Text>
              <TextInput style={[inp, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="e.g. Running low on medication..." placeholderTextColor={t.muted}
                value={note} onChangeText={setNote} multiline numberOfLines={3} />
              <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSubmit} disabled={submitting || prescriptions.length === 0}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Renewal Request</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ padding: 16 }}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>📋 Past Requests</Text>
            {renewals.length === 0
              ? <Text style={{ color: t.muted, fontSize: 13, textAlign: 'center', padding: 16 }}>No renewal requests yet.</Text>
              : renewals.map(r => {
                const sc = statusColor(r.status);
                return (
                  <View key={r.id} style={[styles.renewalCard, { backgroundColor: t.card, borderColor: t.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: t.text, flex: 1 }}>💊 {r.drug}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: t.muted }}>📅 {new Date(r.requestDate).toLocaleDateString('en-GB')}</Text>
                    {r.note && <Text style={{ fontSize: 12, color: t.muted, fontStyle: 'italic', marginTop: 4 }}>📝 {r.note}</Text>}
                  </View>
                );
              })
            }
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  formCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  drugChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  drugChipText: { fontSize: 14, fontWeight: '600' },
  submitBtn: { backgroundColor: MAROON, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  renewalCard: { borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '700' },
});