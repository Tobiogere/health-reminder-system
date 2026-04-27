import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const BG     = '#faf9f7';

// ── Dummy Data ──────────────────────────────────────────────
const todayMeds = [
  { id: 1, name: 'Paracetamol 500mg', time: '08:00 AM', scheduledTime: '08:00', taken: false, missed: false },
  { id: 2, name: 'Amoxicillin 250mg', time: '12:00 PM', scheduledTime: '12:00', taken: false, missed: false },
  { id: 3, name: 'Vitamin C 1000mg',  time: '06:00 PM', scheduledTime: '18:00', taken: false, missed: false },
];
// ────────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation }) {
  const [user, setUser]             = useState(null);
  const [medications, setMedications] = useState(todayMeds);
  const [renewalSent, setRenewalSent] = useState(false);

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

    // Check missed doses every minute
    const interval = setInterval(() => {
      checkMissedDoses();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkMissedDoses = () => {
    const now = new Date();
    setMedications(prev => prev.map(med => {
      if (med.taken || med.missed) return med;
      const [hours, minutes] = med.scheduledTime.split(':').map(Number);
      const scheduled = new Date();
      scheduled.setHours(hours, minutes, 0, 0);
      const diff = (now - scheduled) / 60000;
      return { ...med, missed: diff > 90 };
    }));
  };

  const markTaken = (id) => {
    setMedications(prev =>
      prev.map(m => m.id === id ? { ...m, taken: true } : m)
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const takenCount  = medications.filter(m => m.taken).length;
  const totalCount  = medications.length;
  const missedCount = medications.filter(m => m.missed && !m.taken).length;
  const missedMeds  = medications.filter(m => m.missed && !m.taken);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileInitial}>
              {user?.name?.charAt(0).toUpperCase() || 'P'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, { borderTopColor: MAROON }]}>
            <Text style={[styles.cardNumber, { color: MAROON }]}>{totalCount}</Text>
            <Text style={styles.cardLabel}>Today's Meds</Text>
          </View>
          <View style={[styles.card, { borderTopColor: '#198754' }]}>
            <Text style={[styles.cardNumber, { color: '#198754' }]}>{takenCount}</Text>
            <Text style={styles.cardLabel}>Taken</Text>
          </View>
          <View style={[styles.card, { borderTopColor: '#fd7e14' }]}>
            <Text style={[styles.cardNumber, { color: '#fd7e14' }]}>{totalCount - takenCount - missedCount}</Text>
            <Text style={styles.cardLabel}>Remaining</Text>
          </View>
          <View style={[styles.card, { borderTopColor: '#dc3545' }]}>
            <Text style={[styles.cardNumber, { color: '#dc3545' }]}>{missedCount}</Text>
            <Text style={styles.cardLabel}>Missed</Text>
          </View>
        </View>

        {/* Missed Dose Alert */}
        {missedMeds.length > 0 && (
          <View style={styles.missedAlert}>
            <Text style={styles.missedAlertTitle}>⚠️ Missed Dose{missedMeds.length > 1 ? 's' : ''} Today</Text>
            {missedMeds.map(med => (
              <View key={med.id} style={styles.missedAlertRow}>
                <Text style={styles.missedAlertDrug}>{med.name}</Text>
                <Text style={styles.missedAlertTime}>Due at {med.time}</Text>
              </View>
            ))}
            <Text style={styles.missedAlertNote}>
              Please inform your doctor or pharmacist if you continue to miss doses.
            </Text>
          </View>
        )}

        {/* Today's Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💊 Today's Medications</Text>
            <Text style={styles.sectionCount}>{takenCount}/{totalCount} taken</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${(takenCount / totalCount) * 100}%`
            }]} />
          </View>

          {medications.map(med => (
            <View
              key={med.id}
              style={[
                styles.medCard,
                med.taken  && styles.medCardTaken,
                med.missed && !med.taken && styles.medCardMissed,
              ]}
            >
              <View style={styles.medInfo}>
                <Text style={[
                  styles.medName,
                  med.taken && styles.medNameTaken,
                  med.missed && !med.taken && styles.medNameMissed,
                ]}>
                  {med.name}
                </Text>
                <Text style={styles.medTime}>
                  🕐 {med.time}
                  {med.missed && !med.taken && (
                    <Text style={styles.missedTag}> · Missed</Text>
                  )}
                </Text>
              </View>

              {med.taken ? (
                <Text style={styles.takenBadge}>✅ Taken</Text>
              ) : med.missed ? (
                <Text style={styles.missedBadge}>❌ Missed</Text>
              ) : (
                <TouchableOpacity
                  style={styles.markBtn}
                  onPress={() => markTaken(med.id)}
                >
                  <Text style={styles.markBtnText}>Mark Taken</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Active Prescription */}
        <View style={styles.section}>
          <View style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <Text style={styles.sectionTitle}>📄 Active Prescription</Text>
              {!renewalSent ? (
                <TouchableOpacity
                  style={styles.renewalBtn}
                  onPress={() => navigation.navigate('RenewalRequest')}
                >
                  <Text style={styles.renewalBtnText}>🔄 Renew</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.renewalSent}>✅ Requested</Text>
              )}
            </View>
            <View style={styles.prescriptionDetails}>
              <Text style={styles.prescriptionRow}>📅 Issued: <Text style={styles.bold}>10 Apr 2026</Text></Text>
              <Text style={styles.prescriptionRow}>👨‍⚕️ Doctor: <Text style={styles.bold}>Dr. Adebayo</Text></Text>
              <Text style={styles.prescriptionRow}>🩺 Diagnosis: <Text style={styles.bold}>Malaria</Text></Text>
              <Text style={styles.prescriptionRow}>💊 Drugs: <Text style={styles.bold}>Paracetamol, Amoxicillin, Vitamin C</Text></Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '📅', label: 'My Schedule',   screen: 'MedicationSchedule'  },
              { icon: '📋', label: 'History',        screen: 'PrescriptionHistory' },
              { icon: '🔄', label: 'Request Renewal',screen: 'RenewalRequest'      },
              { icon: '👤', label: 'My Profile',     screen: 'Profile'             },
            ].map(action => (
              <TouchableOpacity
                key={action.screen}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: MAROON,
  },

  // Header
  header: {
    backgroundColor: MAROON,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  profileBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: MAROON,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Summary Cards
  cardsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  cardLabel: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
    textAlign: 'center',
  },

  // Missed Alert
  missedAlert: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f5c2c7',
  },
  missedAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#842029',
    marginBottom: 8,
  },
  missedAlertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  missedAlertDrug: {
    fontSize: 13,
    fontWeight: '600',
    color: '#842029',
  },
  missedAlertTime: {
    fontSize: 12,
    color: '#842029',
  },
  missedAlertNote: {
    fontSize: 11,
    color: '#842029',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 10,
  },
  sectionCount: {
    fontSize: 12,
    color: '#6c757d',
  },

  // Progress
  progressBg: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 999,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#198754',
    borderRadius: 999,
  },

  // Medication cards
  medCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  medCardTaken: {
    backgroundColor: '#f0fff4',
    borderColor: '#b7ebc8',
    opacity: 0.8,
  },
  medCardMissed: {
    backgroundColor: '#fff5f5',
    borderColor: '#f5c2c7',
  },
  medInfo: { flex: 1 },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 3,
  },
  medNameTaken: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  medNameMissed: { color: '#842029' },
  medTime: { fontSize: 12, color: '#6c757d' },
  missedTag: { color: '#dc3545', fontWeight: '600' },
  takenBadge: { fontSize: 13, color: '#198754', fontWeight: '600' },
  missedBadge: { fontSize: 13, color: '#dc3545', fontWeight: '600' },
  markBtn: {
    backgroundColor: MAROON,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  markBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Prescription
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prescriptionDetails: { gap: 4 },
  prescriptionRow: { fontSize: 13, color: '#6c757d', marginBottom: 3 },
  bold: { fontWeight: '700', color: '#212529' },
  renewalBtn: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  renewalBtnText: { fontSize: 12, fontWeight: '700', color: '#856404' },
  renewalSent: { fontSize: 12, color: '#198754', fontWeight: '600' },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
  },

  // Logout
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  logoutText: {
    color: '#dc3545',
    fontWeight: '700',
    fontSize: 14,
  },
});