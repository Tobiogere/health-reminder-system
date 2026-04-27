import api from './api';

// GET /notifications
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
  // Expected response: array of notification objects
  // [
  //   {
  //     id: 1,
  //     type: "reminder" | "missed" | "renewal",
  //     message: "Time to take Paracetamol 500mg",
  //     drug: "Paracetamol 500mg",
  //     time: "08:00 AM",
  //     read: false,
  //     missed: false,
  //     createdAt: "2026-04-19T08:00:00Z"
  //   }
  // ]
};

// PATCH /notifications/:id/read
export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

// PATCH /notifications/read-all
export const markAllRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};