import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const BG     = '#faf9f7';

const prescriptions = [
  {
    id: 1,
    diagnosis: 'Malaria',
    doctor: 'Dr. Adebayo',
    date: '10 Apr 2026',
    status: 'active',
    drugs: [
      { name: 'Paracetamol 500mg', frequency: 'Three times daily', duration: '7 days' },
      { name: 'Amoxicillin 250mg', frequency: 'Twice daily',       duration: '7 days' },
      { name: 'Vitamin C 1000mg',  frequency: 'Once daily',        duration: '7 days' },
    ],
  },
  {
    id: 2,
    diagnosis: 'Typhoid Fever',
    doctor: 'Dr. Salami',
    date: '15 Jan 2026',
    status: 'completed',
    drugs: [
      { name: 'Ciprofloxacin 500mg', frequency: 'Twice daily', duration: '10 days' },
      { name: 'Oral Rehydration Salt', frequency: 'As needed', duration: '5 days'  },
    ],
  },
  {
    id: 3,
    diagnosis: 'Upper Respiratory Tract Infection',
    doctor: 'Dr. Adebayo',
    date: '02 Nov 2025',
    status: 'completed',
    drugs: [
      { name: 'Amoxicillin 500mg',   frequency: 'Three times daily', duration: '5 days' },
      { name: 'Loratadine 10mg',     frequency: 'Once daily',        duration: '5 days' },
      { name: 'Cough Syrup 10ml',    frequency: 'Three times daily', duration: '5 days' },
    ],
  },
];

const statusConfig = {
  active:    { label: 'Active',    bg: '#d1e7dd', text: '#0f5132', dot: '#198754' },
  completed: { label: 'Completed', bg: '#e2e3e5', text: '#41464b', dot: '#6c757d' },
  expired:   { label: 'Expired',   bg: '#f8d7da', text: '#842029', dot: '#dc3545' },
};

export default function PrescriptionHistoryScreen({ navigation }) {
  const [expanded, setExpanded] = useState(1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription History</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.totalText}>{prescriptions.length} prescriptions total</Text>

          {prescriptions.map(p => {
            const status  = statusConfig[p.status];
            const isOpen  = expanded === p.id;

            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.card, isOpen && styles.cardOpen]}
                onPress={() => setExpanded(isOpen ? null : p.id)}
                activeOpacity={0.8}
              >
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.diagnosis}>{p.diagnosis}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
                        <Text style={[styles.statusText, { color: status.text }]}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.doctor}>👨‍⚕️ {p.doctor}</Text>
                    <Text style={styles.date}>📅 {p.date}</Text>
                    <Text style={styles.drugCount}>💊 {p.drugs.length} drug{p.drugs.length > 1 ? 's' : ''} prescribed</Text>
                  </View>
                  <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                </View>

                {/* Expanded drug list */}
                {isOpen && (
                  <View style={styles.drugList}>
                    <View style={styles.drugListDivider} />
                    {p.drugs.map((drug, i) => (
                      <View key={i} style={styles.drugItem}>
                        <View style={[styles.drugIndex, { backgroundColor: MAROON }]}>
                          <Text style={styles.drugIndexText}>{i + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.drugName}>{drug.name}</Text>
                          <Text style={styles.drugDetail}>
                            {drug.frequency} · {drug.duration}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Request renewal if active */}
                    {p.status === 'active' && (
                      <TouchableOpacity
                        style={styles.renewBtn}
                        onPress={() => navigation.navigate('RenewalRequest')}
                      >
                        <Text style={styles.renewBtnText}>🔄 Request Renewal</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
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

  section: { padding: 16 },

  totalText: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 14,
    fontWeight: '500',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardOpen: {
    borderColor: MAROON + '40',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  diagnosis: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusDot: {
    width: 6, height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  doctor: { fontSize: 12, color: '#6c757d', marginBottom: 2 },
  date:   { fontSize: 12, color: '#6c757d', marginBottom: 2 },
  drugCount: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  chevron: { fontSize: 12, color: '#adb5bd', marginTop: 4 },

  // Drug list
  drugList: { marginTop: 8 },
  drugListDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  drugItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  drugIndex: {
    width: 24, height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  drugIndexText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  drugName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  drugDetail: {
    fontSize: 12,
    color: '#6c757d',
  },

  // Renew button
  renewBtn: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  renewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#856404',
  },
});