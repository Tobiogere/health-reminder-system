import api from './api';

// PATCH /users/profile
export const updateProfile = async (profileData) => {
  const response = await api.patch('/users/profile', profileData);
  return response.data;
};

// PATCH /users/password
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.patch('/users/password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};