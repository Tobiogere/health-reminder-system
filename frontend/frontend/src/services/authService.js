import api from './api';

// POST /auth/login
export const loginUser = async (identifier, password, role) => {
  const response = await api.post('/auth/login', {
    identifier,
    password,
    role,
  });
  return response.data;
  // Expected response:
  // {
  //   token: "eyJhbGci...",
  //   user: {
  //     name: "John Doe",
  //     role: "patient",
  //     identifier: "STU/2024/001",
  //     patientType: "student"
  //   }
  // }
};

// POST /auth/register
export const registerUser = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;
  // Expected response:
  // { message: "Registration successful" }
};

// POST /auth/logout
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Even if this fails, we still clear local state
    console.error('Logout error:', err);
  }
};