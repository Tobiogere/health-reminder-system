import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { scheduleAllMedicationReminders } from '../services/notificationService';
const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const API    = 'http://10.201.102.198:8000';

const groupByDrug = (medications) => {
  const groups = {};
  medications.forEach(med => {
    if (!groups[med.name]) groups[med.name] = { name: med.name, doses: [] };
    groups[med.name].doses.push(med);
  });
  return Object.values(groups);
};

const DrugCard = ({ group, onMarkTaken, t }) => {
  const [open, setOpen] = useState(false);
  const takenCount  = group.doses.filter(d => d.status === 'taken').length;
  const missedCount = group.doses.filter(d => d.status === 'missed').length;
  const overallStatus = group.doses.every(d => d.status === 'taken') ? 'taken'
    : group.doses.some(d => d.status === 'missed') ? 'missed' : 'pending';

  return (
    <View style={[styles.drugCard, { backgroundColor: t.card, borderColor: t.border },
      overallStatus === 'taken'  && { backgroundColor: t.dark ? '#1a3a2a' : '#f0fff4', borderColor: '#b7ebc8' },
      overallStatus === 'missed' && { backgroundColor: t.dark ? '#3a1a1a' : '#fff5f5', borderColor: '#f5c2c7' },
    ]}>
      <TouchableOpacity style={styles.drugCardHeader} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.drugCardName, { color: t.text },
            overallStatus === 'taken'  && { textDecorationLine: 'line-through', color: t.muted },
            overallStatus === 'missed' && { color: '#842029' },
          ]}>{group.name}</Text>
          <Text style={[styles.drugCardSub, { color: t.muted }]}>
            {takenCount}/{group.doses.length} taken{missedCount > 0 ? ` · ${missedCount} missed` : ''}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {overallStatus === 'taken'  && <Text style={{ fontSize: 12, color: '#198754', fontWeight: '600' }}>✅ Done</Text>}
          {overallStatus === 'missed' && takenCount === 0 && <Text style={{ fontSize: 12, color: '#dc3545', fontWeight: '600' }}>❌</Text>}
          <Text style={{ fontSize: 11, color: t.muted }}>{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {open && (
        <View style={[styles.dosesDropdown, { borderTopColor: t.border }]}>
          {group.doses.map(dose => (
            <View key={dose.id} style={[styles.doseRow, { borderBottomColor: t.border }]}>
              <Text style={{ fontSize: 13, color: t.muted }}>🕐 {dose.time}</Text>
              {dose.status === 'taken' ? <Text style={{ fontSize: 12, color: '#198754', fontWeight: '600' }}>✅ Taken</Text>
               : dose.status === 'missed' ? <Text style={{ fontSize: 12, color: '#dc3545', fontWeight: '600' }}>❌ Missed</Text>
               : <TouchableOpacity style={styles.markBtn} onPress={() => onMarkTaken(dose.id)}>
                   <Text style={styles.markBtnText}>Mark Taken</Text>
                 </TouchableOpacity>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function DashboardScreen({ navigation }) {
  const { theme: t } = useTheme();
  const [user, setUser]           = useState(null);
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token    = await AsyncStorage.getItem('token');
      if (!userData || !token) { navigation.replace('Login'); return; }
      const u = JSON.parse(userData);
      setUser(u);
      const [medsRes, prescRes] = await Promise.all([
        fetch(`${API}/patients/${u.id}/medications/today`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/patients/${u.id}/prescriptions`,    { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const medsData = await medsRes.json();
      const prescData = await prescRes.json();
      if (medsRes.ok && Array.isArray(medsData)) {
        setMedications(medsData);
        scheduleAllMedicationReminders(medsData);
      }
      if (prescRes.ok && Array.isArray(prescData)) setPrescriptions(prescData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [navigation]);

  useEffect(() => { loadData(); }, [loadData]);
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('user').then(u => { if (u) setUser(JSON.parse(u)); });
  }, []));

  const markTaken = async (doseId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/medications/${doseId}/taken`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) setMedications(prev => prev.map(m => m.id === doseId ? { ...m, status: 'taken' } : m));
    } catch {}
  };

  const takenCount  = medications.filter(m => m.status === 'taken').length;
  const missedCount = medications.filter(m => m.status === 'missed').length;
  const remaining   = medications.filter(m => m.status === 'pending').length;
  const missedMeds  = medications.filter(m => m.status === 'missed');
  const drugGroups  = groupByDrug(medications);
  const activePrescriptions = prescriptions.filter(p => p.status === 'active');
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MAROON }}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={{ width: 38, height: 38, borderRadius: 19 }} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '800', color: MAROON }}>{user?.name?.charAt(0).toUpperCase() || 'P'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={MAROON} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[MAROON]} />}>

          {/* Summary Cards */}
          <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
            {[
              { label: "Today's", value: medications.length, color: MAROON },
              { label: 'Taken',   value: takenCount,          color: '#198754' },
              { label: 'Left',    value: remaining,            color: '#fd7e14' },
              { label: 'Missed',  value: missedCount,          color: '#dc3545' },
            ].map(s => (
              <View key={s.label} style={[styles.card, { backgroundColor: t.card, borderTopColor: s.color }]}>
                <Text style={[styles.cardNumber, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.cardLabel, { color: t.muted }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Missed Alert */}
          {missedMeds.length > 0 && (
            <View style={[styles.missedAlert, { backgroundColor: t.dark ? '#3a1a1a' : '#fff5f5' }]}>
              <Text style={styles.missedAlertTitle}>⚠️ Missed Today</Text>
              {missedMeds.slice(0, 3).map(med => (
                <View key={med.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.missedAlertDrug}>{med.name}</Text>
                  <Text style={styles.missedAlertTime}>Due {med.time}</Text>
                </View>
              ))}
              {missedMeds.length > 3 && <Text style={{ color: '#842029', fontSize: 11, fontStyle: 'italic' }}>+{missedMeds.length - 3} more</Text>}
            </View>
          )}

          {/* Today's Meds */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>💊 Today's Medications</Text>
              <Text style={{ fontSize: 12, color: t.muted }}>{takenCount}/{medications.length} taken</Text>
            </View>
            {medications.length > 0 && (
              <View style={{ height: 6, backgroundColor: t.border, borderRadius: 999, marginBottom: 12 }}>
                <View style={{ height: '100%', backgroundColor: '#198754', borderRadius: 999,
                  width: `${medications.length > 0 ? (takenCount / medications.length) * 100 : 0}%` }} />
              </View>
            )}
            {drugGroups.length === 0
              ? <Text style={{ color: t.muted, fontSize: 13, textAlign: 'center', padding: 16 }}>No medications today.</Text>
              : drugGroups.map(g => <DrugCard key={g.name} group={g} onMarkTaken={markTaken} t={t} />)
            }
          </View>

          {/* Active Prescriptions */}
          {activePrescriptions.length > 0 && (
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>📄 Active Prescriptions</Text>
              {activePrescriptions.slice(0, 3).map(rx => (
                <View key={rx.id} style={[styles.prescriptionCard, { backgroundColor: t.card, borderColor: t.border }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: t.text, flex: 1 }}>💊 {rx.medicationName}</Text>
                    <TouchableOpacity style={styles.renewalBtn} onPress={() => navigation.navigate('RenewalRequest')}>
                      <Text style={styles.renewalBtnText}>🔄 Renew</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 12, color: t.muted }}>🩺 {rx.diagnosis}</Text>
                  <Text style={{ fontSize: 12, color: t.muted }}>👨‍⚕️ {rx.doctorName}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { icon: '📅', label: 'My Schedule',    screen: 'MedicationSchedule'  },
                { icon: '📋', label: 'History',         screen: 'PrescriptionHistory' },
                { icon: '🔄', label: 'Request Renewal', screen: 'RenewalRequest'      },
                { icon: '👤', label: 'My Profile',      screen: 'Profile'             },
              ].map(action => (
                <TouchableOpacity key={action.screen} style={[styles.actionCard, { backgroundColor: t.card, borderColor: t.border }]}
                  onPress={() => navigation.navigate(action.screen)}>
                  <Text style={{ fontSize: 28, marginBottom: 8 }}>{action.icon}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: t.text, textAlign: 'center' }}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={async () => { await AsyncStorage.multiRemove(['token', 'user']); navigation.replace('Login'); }}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: MAROON, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  userName: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 2 },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  profileBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  card: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderTopWidth: 3, elevation: 2 },
  cardNumber: { fontSize: 22, fontWeight: '800' },
  cardLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  missedAlert: { borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, borderColor: '#f5c2c7' },
  missedAlertTitle: { fontSize: 14, fontWeight: '700', color: '#842029', marginBottom: 8 },
  missedAlertDrug: { fontSize: 13, fontWeight: '600', color: '#842029' },
  missedAlertTime: { fontSize: 12, color: '#842029' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  drugCard: { borderRadius: 12, marginBottom: 8, borderWidth: 1, overflow: 'hidden' },
  drugCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  drugCardName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  drugCardSub: { fontSize: 12 },
  dosesDropdown: { borderTopWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  doseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  markBtn: { backgroundColor: MAROON, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  markBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  prescriptionCard: { borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1 },
  renewalBtn: { backgroundColor: '#fff3cd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#ffc107' },
  renewalBtnText: { fontSize: 12, fontWeight: '700', color: '#856404' },
  actionCard: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, elevation: 1 },
  logoutBtn: { marginHorizontal: 16, marginTop: 8, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1 },
  logoutText: { color: '#dc3545', fontWeight: '700', fontSize: 14 },
});