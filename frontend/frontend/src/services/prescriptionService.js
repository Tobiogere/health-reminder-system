import api from './api';

// GET /prescriptions — all prescriptions (admin)
export const getAllPrescriptions = async () => {
  const response = await api.get('/prescriptions');
  return response.data;
};

// GET /prescriptions/doctor/:doctorId
export const getDoctorPrescriptions = async (doctorId) => {
  const response = await api.get(`/prescriptions/doctor/${doctorId}`);
  return response.data;
};

// POST /prescriptions
export const createPrescription = async (prescriptionData) => {
  const response = await api.post('/prescriptions', prescriptionData);
  return response.data;
  // prescriptionData shape:
  // {
  //   patientId:   "STU/2024/001",
  //   patientName: "John Doe",
  //   doctorName:  "Dr. Adebayo",
  //   diagnosis:   "Malaria",
  //   drugs:       ["Paracetamol 500mg", "Coartem"],
  //   notes:       "Take after meals"
  // }
};

// GET /prescriptions/queue — pharmacist queue
export const getPrescriptionQueue = async () => {
  const response = await api.get('/prescriptions/queue');
  return response.data;
};

// PATCH /prescriptions/:id/dosage
export const addDosageDetails = async (prescriptionId, dosageData) => {
  const response = await api.patch(
    `/prescriptions/${prescriptionId}/dosage`,
    dosageData
  );
  return response.data;
  // dosageData shape:
  // {
  //   dosages: [
  //     {
  //       drug: "Paracetamol 500mg",
  //       dosage: "1 tablet",
  //       frequency: "Twice daily",
  //       duration: "7 days",
  //       times: ["08:00", "20:00"]
  //     }
  //   ]
  // }
};