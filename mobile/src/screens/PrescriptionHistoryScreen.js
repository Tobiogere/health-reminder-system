import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const MAROON = '#6B0F1A';
const API    = 'http://10.201.102.198:8000';

export default function PrescriptionHistoryScreen({ navigation }) {
  const { theme: t } = useTheme();
  const [prescriptions, setPrescriptions] = useState([]);
  const [expanded, setExpanded]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token    = await AsyncStorage.getItem('token');
      if (!userData || !token) return;
      const u = JSON.parse(userData);
      const res = await fetch(`${API}/patients/${u.id}/prescriptions`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) { setPrescriptions(data); if (data.length > 0) setExpanded(data[0].id); }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusConfig = {
    active:  { label: 'Active',    bg: '#d1e7dd', text: '#0f5132', dot: '#198754' },
    missed:  { label: 'Missed',    bg: '#f8d7da', text: '#842029', dot: '#dc3545' },
    pending: { label: 'Pending',   bg: '#fff3cd', text: '#856404', dot: '#ffc107' },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MAROON }}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription History</Text>
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
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 13, color: t.muted, marginBottom: 14, fontWeight: '500' }}>
              {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} total
            </Text>
            {prescriptions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>📋</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: t.text }}>No Prescriptions Yet</Text>
              </View>
            ) : (
              prescriptions.map(p => {
                const status = statusConfig[p.status] || statusConfig.active;
                const isOpen = expanded === p.id;
                return (
                  <TouchableOpacity key={p.id}
                    style={[styles.card, { backgroundColor: t.card, borderColor: isOpen ? MAROON + '40' : t.border },
                      isOpen && { borderWidth: 1.5 }]}
                    onPress={() => setExpanded(isOpen ? null : p.id)} activeOpacity={0.8}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: t.text, flex: 1 }}>{p.diagnosis}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
                            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 12, color: t.muted, marginBottom: 2 }}>👨‍⚕️ {p.doctorName || '—'}</Text>
                        <Text style={{ fontSize: 12, color: t.muted, marginBottom: 2 }}>📅 {new Date(p.createdAt).toLocaleDateString('en-GB')}</Text>
                        <Text style={{ fontSize: 12, color: t.muted }}>💊 {p.medicationName}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{isOpen ? '▲' : '▼'}</Text>
                    </View>
                    {isOpen && (
                      <View style={{ marginTop: 8 }}>
                        <View style={{ height: 1, backgroundColor: t.border, marginBottom: 12 }} />
                        {p.dosage && <Text style={{ fontSize: 13, color: t.muted, marginBottom: 8 }}>💉 Dosage: <Text style={{ fontWeight: '700', color: t.text }}>{p.dosage}</Text></Text>}
                        {p.status === 'active' && (
                          <TouchableOpacity style={styles.renewBtn} onPress={() => navigation.navigate('RenewalRequest')}>
                            <Text style={styles.renewBtnText}>🔄 Request Renewal</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
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
  card: { borderRadius: 14, marginBottom: 12, padding: 16, borderWidth: 1, elevation: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  renewBtn: { backgroundColor: '#fff3cd', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffc107' },
  renewBtnText: { fontSize: 13, fontWeight: '700', color: '#856404' },
});