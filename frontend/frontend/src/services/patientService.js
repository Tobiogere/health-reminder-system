import api from './api';

// GET /patients/:identifier
export const getPatientByIdentifier = async (identifier) => {
  const response = await api.get(`/patients/${identifier}`);
  return response.data;
};

// GET /patients/:id/medications/today
export const getTodayMedications = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/medications/today`);
  return response.data;
};

// PATCH /medications/:medicationId/taken
export const markMedicationTaken = async (medicationId) => {
  const response = await api.patch(`/medications/${medicationId}/taken`);
  return response.data;
};

// GET /patients/:id/schedule
export const getMedicationSchedule = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/schedule`);
  return response.data;
};

// GET /patients/:id/prescriptions
export const getPatientPrescriptions = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/prescriptions`);
  return response.data;
};

// POST /patients/:id/renewals
export const requestRenewal = async (patientId, drugName) => {
  const response = await api.post(`/patients/${patientId}/renewals`, { drugName });
  return response.data;
};