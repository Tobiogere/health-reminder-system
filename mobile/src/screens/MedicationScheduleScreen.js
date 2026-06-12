import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const MAROON = '#6B0F1A';
const API    = 'http://10.201.102.198:8000';
const COLORS = ['#0d6efd', '#198754', '#6f42c1', '#fd7e14', '#dc3545', '#20c997'];

export default function MedicationScheduleScreen({ navigation }) {
  const { theme: t } = useTheme();
  const [schedules, setSchedules]     = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const load = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token    = await AsyncStorage.getItem('token');
      if (!userData || !token) return;
      const u = JSON.parse(userData);
      const res = await fetch(`${API}/patients/${u.id}/schedule`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setSchedules(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selected = schedules[selectedIdx];
  const color    = COLORS[selectedIdx % COLORS.length];
  const today    = new Date().toDateString();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MAROON }}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Schedule</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={MAROON} />
        </View>
      ) : schedules.length === 0 ? (
        <View style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>📅</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: t.text }}>No Schedule Yet</Text>
          <Text style={{ fontSize: 13, color: t.muted, textAlign: 'center', marginTop: 8 }}>Your schedule will appear after the pharmacist processes your prescription.</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[MAROON]} />}>

          <View style={{ padding: 16, marginBottom: 4 }}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Select Medication</Text>
            {schedules.map((s, i) => {
              const c = COLORS[i % COLORS.length];
              return (
                <TouchableOpacity key={s.scheduleId} style={[styles.drugTab, { backgroundColor: t.card, borderColor: t.border, borderLeftColor: c },
                  selectedIdx === i && { backgroundColor: t.subBg }]}
                  onPress={() => setSelectedIdx(i)}>
                  <View style={[styles.drugDot, { backgroundColor: c }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.drugTabName, { color: selectedIdx === i ? t.text : t.muted }]}>{s.medication}</Text>
                    <Text style={[styles.drugTabFreq, { color: t.muted }]}>{s.frequency}x daily · {s.duration} days</Text>
                  </View>
                  {selectedIdx === i && <Text style={{ color: c, fontWeight: '700' }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {selected && (
            <>
              <View style={{ padding: 16, marginBottom: 4 }}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>Schedule Details</Text>
                <View style={[styles.detailCard, { backgroundColor: t.card, borderColor: t.border, borderTopColor: color }]}>
                  {[
                    { label: '💊 Drug',      value: selected.medication },
                    { label: '💉 Dosage',    value: selected.dosage || '—' },
                    { label: '🔁 Frequency', value: `${selected.frequency}x daily` },
                    { label: '📅 Duration',  value: `${selected.duration} days` },
                    { label: '▶️ Start',     value: new Date(selected.startDate).toLocaleDateString('en-GB') },
                    { label: '⏹️ End',       value: new Date(selected.endDate).toLocaleDateString('en-GB') },
                  ].map((row, i, arr) => (
                    <View key={row.label}>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: t.muted }]}>{row.label}</Text>
                        <Text style={[styles.detailValue, { color: t.text }]}>{row.value}</Text>
                      </View>
                      {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: t.border }]} />}
                    </View>
                  ))}
                </View>
              </View>

              {selected.specificTimes?.length > 0 && (
                <View style={{ padding: 16, marginBottom: 4 }}>
                  <Text style={[styles.sectionTitle, { color: t.text }]}>🔔 Reminder Times</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {selected.specificTimes.map((time, i) => (
                      <View key={i} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
                        backgroundColor: color + '15', borderColor: color + '40' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color }}>{time}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selected.doses?.length > 0 && (
                <View style={{ padding: 16 }}>
                  <Text style={[styles.sectionTitle, { color: t.text }]}>📊 Dose History</Text>
                  {selected.doses.slice(0, 7).map(dose => {
                    const isToday = new Date(dose.scheduledTime).toDateString() === today;
                    return (
                      <View key={dose.id} style={[styles.doseRow, { backgroundColor: t.card, borderColor: t.border },
                        dose.status === 'taken'  && { backgroundColor: t.dark ? '#1a3a2a' : '#f0fff4', borderColor: '#b7ebc8' },
                        dose.status === 'missed' && { backgroundColor: t.dark ? '#3a1a1a' : '#fff5f5', borderColor: '#f5c2c7' },
                        isToday && { borderWidth: 2, borderColor: '#C9A84C' },
                      ]}>
                        <Text style={{ fontSize: 12, color: t.muted }}>
                          {new Date(dose.scheduledTime).toLocaleDateString('en-GB')} at{' '}
                          {new Date(dose.scheduledTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          {isToday && <Text style={{ color: '#C9A84C', fontWeight: '700' }}> · TODAY</Text>}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '700',
                          color: dose.status === 'taken' ? '#198754' : dose.status === 'missed' ? '#dc3545' : '#fd7e14' }}>
                          {dose.status === 'taken' ? '✅ Taken' : dose.status === 'missed' ? '❌ Missed' : '⏳ Pending'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
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
  drugTab: { borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderLeftWidth: 4 },
  drugDot: { width: 10, height: 10, borderRadius: 5 },
  drugTabName: { fontSize: 14, fontWeight: '600' },
  drugTabFreq: { fontSize: 12, marginTop: 2 },
  detailCard: { borderRadius: 12, padding: 16, borderTopWidth: 3, borderWidth: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  detailLabel: { fontSize: 13, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1 },
  doseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, marginBottom: 6, borderRadius: 8, borderWidth: 1 },
});