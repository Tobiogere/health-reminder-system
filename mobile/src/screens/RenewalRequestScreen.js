import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, ActivityIndicator,
} from 'react-native';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const BG     = '#faf9f7';

const activePrescriptions = [
  {
    id: 1,
    diagnosis: 'Malaria',
    doctor: 'Dr. Adebayo',
    date: '10 Apr 2026',
    drugs: ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Vitamin C 1000mg'],
  },
];

export default function RenewalRequestScreen({ navigation }) {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [reason, setReason]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    if (!selectedPrescription) {
      setError('Please select a prescription to renew.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for renewal.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // TODO: Replace with real API call
      // await axios.post('/api/renewals/', {
      //   prescriptionId: selectedPrescription.id,
      //   reason,
      // });
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit renewal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Renewal</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Success state */}
        {submitted ? (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Renewal Requested!</Text>
            <Text style={styles.successMessage}>
              Your renewal request has been sent to the pharmacy. You will be
              notified once it is processed.
            </Text>
            <TouchableOpacity
              style={styles.backToDashBtn}
              onPress={() => navigation.replace('Dashboard')}
            >
              <Text style={styles.backToDashText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>

            {/* Info box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ How Renewal Works</Text>
              <Text style={styles.infoText}>
                Select an active prescription and provide a reason. Your request
                will be reviewed by the pharmacist and doctor before approval.
              </Text>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Select prescription */}
            <Text style={styles.label}>Select Prescription to Renew</Text>
            {activePrescriptions.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.prescriptionCard,
                  selectedPrescription?.id === p.id && styles.prescriptionCardSelected,
                ]}
                onPress={() => {
                  setSelectedPrescription(p);
                  setError('');
                }}
              >
                <View style={styles.prescriptionCardHeader}>
                  <Text style={styles.prescriptionDiagnosis}>{p.diagnosis}</Text>
                  <View style={[
                    styles.selectIndicator,
                    selectedPrescription?.id === p.id && styles.selectIndicatorActive,
                  ]}>
                    {selectedPrescription?.id === p.id && (
                      <Text style={styles.selectCheck}>✓</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.prescriptionDoctor}>👨‍⚕️ {p.doctor}</Text>
                <Text style={styles.prescriptionDate}>📅 {p.date}</Text>
                <View style={styles.drugTags}>
                  {p.drugs.map((drug, i) => (
                    <View key={i} style={styles.drugTag}>
                      <Text style={styles.drugTagText}>{drug}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}

            {/* Reason */}
            <Text style={styles.label}>Reason for Renewal</Text>
            <TextInput
              style={styles.textarea}
              placeholder="e.g. I have finished my medications and still need to continue the treatment..."
              placeholderTextColor="#adb5bd"
              value={reason}
              onChangeText={v => {
                setReason(v);
                setError('');
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{reason.length} characters</Text>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Renewal Request</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        )}
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

  // Info box
  infoBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bee5fb',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0c5460',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#0c5460',
    lineHeight: 18,
  },

  // Error
  errorBox: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: '#842029', fontSize: 13 },

  // Label
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    marginTop: 4,
  },

  // Prescription card
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  prescriptionCardSelected: {
    borderColor: MAROON,
    backgroundColor: '#fff8f8',
  },
  prescriptionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  prescriptionDiagnosis: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  selectIndicator: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectIndicatorActive: {
    backgroundColor: MAROON,
    borderColor: MAROON,
  },
  selectCheck: { color: '#fff', fontSize: 12, fontWeight: '700' },
  prescriptionDoctor: { fontSize: 12, color: '#6c757d', marginBottom: 2 },
  prescriptionDate:   { fontSize: 12, color: '#6c757d', marginBottom: 8 },
  drugTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  drugTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  drugTagText: { fontSize: 11, color: '#495057', fontWeight: '500' },

  // Textarea
  textarea: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#fff',
    minHeight: 110,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 11,
    color: '#adb5bd',
    textAlign: 'right',
    marginBottom: 16,
  },

  // Submit button
  submitBtn: {
    backgroundColor: MAROON,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: MAROON,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  successIcon: { fontSize: 60, marginBottom: 20 },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: MAROON,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  backToDashBtn: {
    backgroundColor: MAROON,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  backToDashText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});