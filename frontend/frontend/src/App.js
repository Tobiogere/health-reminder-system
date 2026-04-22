import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import { NotificationProvider } from './context/NotificationContext';
// Dashboards
import PatientDashboard    from './pages/patient/PatientDashboard';
import DoctorDashboard     from './pages/doctor/DoctorDashboard';
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';

// Patient pages
import MedicationSchedule  from './pages/patient/MedicationSchedule';
import PrescriptionHistory from './pages/patient/PrescriptionHistory';
import RenewalRequest      from './pages/patient/RenewalRequest';

// Doctor pages
import SearchPatient       from './pages/doctor/SearchPatient';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';

// Pharmacist pages
import PrescriptionQueue   from './pages/pharmacist/PrescriptionQueue';
import RenewalRequests     from './pages/pharmacist/RenewalRequests';

// Admin placeholder
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDrugs from './pages/admin/AdminDrugs';
import AdminUsers from './pages/admin/AdminUsers';
// const AdminDashboard = () => <h2 style={{ padding: '2rem' }}>Admin Dashboard ⚙️</h2>;

import NotFound from './pages/NotFound';

import Profile from './pages/Profile';

import Landing from './pages/Landing';
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/schedule"  element={<ProtectedRoute allowedRoles={['patient']}><MedicationSchedule /></ProtectedRoute>} />
          <Route path="/patient/history"   element={<ProtectedRoute allowedRoles={['patient']}><PrescriptionHistory /></ProtectedRoute>} />
          <Route path="/patient/renewal"   element={<ProtectedRoute allowedRoles={['patient']}><RenewalRequest /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor/dashboard"     element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/search"        element={<ProtectedRoute allowedRoles={['doctor']}><SearchPatient /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptions /></ProtectedRoute>} />

          {/* Pharmacist */}
          <Route path="/pharmacist/dashboard" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />
          <Route path="/pharmacist/queue"     element={<ProtectedRoute allowedRoles={['pharmacist']}><PrescriptionQueue /></ProtectedRoute>} />
          <Route path="/pharmacist/renewals"  element={<ProtectedRoute allowedRoles={['pharmacist']}><RenewalRequests /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/drugs" element={<ProtectedRoute allowedRoles={['admin']}><AdminDrugs /></ProtectedRoute>} />

          {/* {NotFound} */}
          <Route path="*" element={<NotFound />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'pharmacist', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;