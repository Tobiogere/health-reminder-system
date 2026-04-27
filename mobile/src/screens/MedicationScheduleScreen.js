import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const BG     = '#faf9f7';

const scheduleData = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    diagnosis: 'Malaria',
    frequency: 'Three times daily',
    duration: '7 days',
    startDate: '10 Apr 2026',
    endDate: '17 Apr 2026',
    times: ['08:00 AM', '02:00 PM', '08:00 PM'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'active',
    color: '#0d6efd',
  },
  {
    id: 2,
    name: 'Amoxicillin 250mg',
    diagnosis: 'Malaria',
    frequency: 'Twice daily',
    duration: '7 days',
    startDate: '10 Apr 2026',
    endDate: '17 Apr 2026',
    times: ['08:00 AM', '08:00 PM'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'active',
    color: '#198754',
  },
  {
    id: 3,
    name: 'Vitamin C 1000mg',
    diagnosis: 'Malaria',
    frequency: 'Once daily',
    duration: '7 days',
    startDate: '10 Apr 2026',
    endDate: '17 Apr 2026',
    times: ['08:00 AM'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'active',
    color: '#6f42c1',
  },
];

export default function MedicationScheduleScreen({ navigation }) {
  const [selectedDrug, setSelectedDrug] = useState(scheduleData[0]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Schedule</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Drug selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Medication</Text>
          {scheduleData.map(drug => (
            <TouchableOpacity
              key={drug.id}
              style={[
                styles.drugTab,
                selectedDrug.id === drug.id && styles.drugTabActive,
                { borderLeftColor: drug.color },
              ]}
              onPress={() => setSelectedDrug(drug)}
            >
              <View style={[styles.drugDot, { backgroundColor: drug.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.drugTabName,
                  selectedDrug.id === drug.id && styles.drugTabNameActive,
                ]}>
                  {drug.name}
                </Text>
                <Text style={styles.drugTabFreq}>{drug.frequency}</Text>
              </View>
              {selectedDrug.id === drug.id && (
                <Text style={{ color: drug.color, fontWeight: '700' }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Schedule detail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Details</Text>
          <View style={[styles.detailCard, { borderTopColor: selectedDrug.color }]}>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💊 Drug</Text>
              <Text style={styles.detailValue}>{selectedDrug.name}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🩺 Diagnosis</Text>
              <Text style={styles.detailValue}>{selectedDrug.diagnosis}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🔁 Frequency</Text>
              <Text style={styles.detailValue}>{selectedDrug.frequency}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📅 Duration</Text>
              <Text style={styles.detailValue}>{selectedDrug.duration}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>▶️ Start</Text>
              <Text style={styles.detailValue}>{selectedDrug.startDate}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>⏹️ End</Text>
              <Text style={styles.detailValue}>{selectedDrug.endDate}</Text>
            </View>
          </View>
        </View>

        {/* Reminder times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Reminder Times</Text>
          <View style={styles.timesRow}>
            {selectedDrug.times.map((time, i) => (
              <View key={i} style={[styles.timeChip, { backgroundColor: selectedDrug.color + '15', borderColor: selectedDrug.color + '40' }]}>
                <Text style={[styles.timeChipText, { color: selectedDrug.color }]}>{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📆 Active Days</Text>
          <View style={styles.daysRow}>
            {selectedDrug.days.map((day, i) => (
              <View key={i} style={[styles.dayChip, { backgroundColor: selectedDrug.color }]}>
                <Text style={styles.dayChipText}>{day}</Text>
              </View>
            ))}
          </View>
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

  scroll: { flex: 1, backgroundColor: BG, borderTopLeftRadius: 24, borderTopRightRadius: 24 },

  section: { padding: 16, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#212529', marginBottom: 12 },

  // Drug tabs
  drugTab: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderLeftWidth: 4,
  },
  drugTabActive: {
    backgroundColor: '#f8f9ff',
    borderColor: '#e9ecef',
  },
  drugDot: { width: 10, height: 10, borderRadius: 5 },
  drugTabName: { fontSize: 14, fontWeight: '600', color: '#495057' },
  drugTabNameActive: { color: '#212529' },
  drugTabFreq: { fontSize: 12, color: '#6c757d', marginTop: 2 },

  // Detail card
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: { fontSize: 13, color: '#6c757d', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#212529', fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },

  // Times
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeChipText: { fontSize: 14, fontWeight: '700' },

  // Days
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});