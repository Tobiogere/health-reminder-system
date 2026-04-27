import api from './api';

// GET /renewals — all renewal requests
export const getAllRenewals = async () => {
  const response = await api.get('/renewals');
  return response.data;
};

// PATCH /renewals/:id/approve
export const approveRenewal = async (renewalId) => {
  const response = await api.patch(`/renewals/${renewalId}/approve`);
  return response.data;
};

// PATCH /renewals/:id/reject
export const rejectRenewal = async (renewalId) => {
  const response = await api.patch(`/renewals/${renewalId}/reject`);
  return response.data;
};

// PATCH /renewals/:id/approve
// After approving, backend should create a notification for the patient:
// {
//   type: "renewal",
//   message: "Your renewal request for [drug] has been approved",
//   read: false
// }
