import api from './api';

// GET /drugs — fetch all approved drugs
export const getDrugs = async () => {
  const response = await api.get('/drugs');
  return response.data;
  // Expected response: array of drug name strings
  // ["Paracetamol 500mg", "Amoxicillin 250mg", ...]
};

// POST /drugs/suggest — doctor suggests a new drug
export const suggestDrug = async (drugName, doctorName) => {
  const response = await api.post('/drugs/suggest', { drugName, doctorName });
  return response.data;
};

// PATCH /drugs/:id/approve — admin approves a drug
export const approveDrug = async (drugId) => {
  const response = await api.patch(`/drugs/${drugId}/approve`);
  return response.data;
};

// PATCH /drugs/:id/reject — admin rejects a drug
export const rejectDrug = async (drugId) => {
  const response = await api.patch(`/drugs/${drugId}/reject`);
  return response.data;
};

// GET /drugs/suggestions — admin views all suggestions
export const getDrugSuggestions = async () => {
  const response = await api.get('/drugs/suggestions');
  return response.data;
};