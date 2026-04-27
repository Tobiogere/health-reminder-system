import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → send to their own dashboard
  if (!allowedRoles.includes(user.role)) {
    const dashboards = {
      patient:    '/patient/dashboard',
      doctor:     '/doctor/dashboard',
      pharmacist: '/pharmacist/dashboard',
      admin:      '/admin/dashboard',
    };
    return <Navigate to={dashboards[user.role]} replace />;
  }

  // All good → render the page
  return children;
};

export default ProtectedRoute;