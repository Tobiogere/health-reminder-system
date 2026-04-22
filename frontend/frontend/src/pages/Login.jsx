import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
// import { loginUser } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  // const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };


const navigate = useNavigate();
const { login } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  const { identifier, password, role } = formData;

  if (!identifier || !password || !role) {
    setError('Please fill in all fields.');
    return;
  }

  // TODO: Replace with real API call when backend is ready
  // try {
  //   setLoading(true);
  //   const data = await loginUser(identifier, password, role);
  //   localStorage.setItem('token', data.token);
  //   localStorage.setItem('user', JSON.stringify(data.user));
  //   login(data.user);
  // } catch (err) {
  //   setError(err.response?.data?.message || 'Invalid credentials.');
  //   return;
  // } finally {
  //   setLoading(false);
  // }

  // Temporary — simulate login until backend is ready
  login({
    name: 'Test User',
    role: role,
    identifier: identifier,
  });

  const dashboards = {
    patient:    '/patient/dashboard',
    doctor:     '/doctor/dashboard',
    pharmacist: '/pharmacist/dashboard',
    admin:      '/admin/dashboard',
  };

  navigate(dashboards[role]);
};

  const getIdentifierLabel = () => {
    if (formData.role === 'patient') return 'Matric No / Staff ID / Phone Number';
    if (['doctor', 'pharmacist', 'admin'].includes(formData.role)) return 'Staff ID';
    return 'Matric No / Staff ID';
  };

  const getIdentifierPlaceholder = () => {
    if (formData.role === 'patient') return 'Matric No, Staff ID, or Phone Number';
    if (['doctor', 'pharmacist', 'admin'].includes(formData.role)) return 'e.g. STF/2024/042';
    return 'Enter your ID';
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}
    >
      <div
        className="card-custom"
        style={{ width: '100%', maxWidth: '420px', padding: '1.8rem' }}
      >
        {/* Header */}
        <div className="text-center mb-3">
          <div style={{ fontSize: '2rem' }}>🏥</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.5rem' }}>
            Redeemer's University Health Centre
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 0 }}>
            Medication Reminder System
          </p>
        </div>

        <hr style={{ marginBottom: '1.2rem' }} />

        <form onSubmit={handleSubmit} noValidate>

          {/* Role FIRST */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
              Login as
            </label>
            <select
              name="role"
              className="form-select form-select-sm"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">-- Select your role --</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Identifier — reacts to role */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
              {getIdentifierLabel()}
            </label>
            <input
              type="text"
              name="identifier"
              className="form-control form-control-sm"
              placeholder={getIdentifierPlaceholder()}
              value={formData.identifier}
              onChange={handleChange}
            />
            {formData.role === 'patient' && (
              <small style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                External patients: enter your phone number
              </small>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              className="form-control form-control-sm"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger py-1 mb-3" style={{ fontSize: '0.82rem' }} role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn-primary-custom" style={{ padding: '0.55rem' }}>
            Login
          </button>

          {/* Link to Register */}
          <p className="text-center mt-3 mb-0" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Register here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;