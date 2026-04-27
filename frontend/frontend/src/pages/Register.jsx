import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    phoneNumber: '',
    role: '',
    password: '',
    confirmPassword: '',
    patientType: '',
    matricNumber: '',
    department: '',
    staffId: '',
  });

  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData({ ...formData, role: value, patientType: '', matricNumber: '', department: '', staffId: '' });
    } else if (name === 'patientType') {
      setFormData({ ...formData, patientType: value, matricNumber: '', department: '', staffId: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const validate = () => {
    const { fullName, gender, phoneNumber, role, password, confirmPassword, patientType, matricNumber, department, staffId } = formData;
    if (!fullName || !gender || !phoneNumber || !role || !password || !confirmPassword)
      return 'Please fill in all required fields.';
    if (password !== confirmPassword)
      return 'Passwords do not match.';
    if (password.length < 6)
      return 'Password must be at least 6 characters.';
    if (role === 'patient') {
      if (!patientType) return 'Please select a patient type.';
      if (patientType === 'student' && (!matricNumber || !department))
        return 'Please enter your matric number and department.';
      if (patientType === 'staff' && !staffId)
        return 'Please enter your staff ID.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setLoading(true);
      // TODO: Replace with real API call
      // await registerUser(formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { role, patientType } = formData;

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}
    >
      <div className="card-custom" style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>🏥</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.5rem' }}>
            Redeemer's University Health Centre
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Create your account
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success py-2 mb-3" role="alert">
            ✅ Registration successful! Redirecting to login...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Gender</label>
            <select
              name="gender"
              className="form-select"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">-- Select gender --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              className="form-control"
              placeholder="e.g. 08012345678"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Register as</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">-- Select your role --</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>

          {/* Patient-specific fields */}
          {role === 'patient' && (
            <div
              className="mb-3 p-3"
              style={{
                backgroundColor: '#f8f9ff',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
              }}
            >
              <div className="mb-3">
                <label className="form-label fw-semibold">Patient Type</label>
                <select
                  name="patientType"
                  className="form-select"
                  value={formData.patientType}
                  onChange={handleChange}
                >
                  <option value="">-- Select patient type --</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="external">External Patient</option>
                </select>
              </div>

              {patientType === 'student' && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Matric Number</label>
                    <input
                      type="text"
                      name="matricNumber"
                      className="form-control"
                      placeholder="e.g. RUN/CMP/20/12236"
                      value={formData.matricNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-1">
                    <label className="form-label fw-semibold">Department</label>
                    <input
                      type="text"
                      name="department"
                      className="form-control"
                      placeholder="e.g. Computer Science"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {patientType === 'staff' && (
                <div className="mb-1">
                  <label className="form-label fw-semibold">Staff ID</label>
                  <input
                    type="text"
                    name="staffId"
                    className="form-control"
                    placeholder="e.g. STF/2024/042"
                    value={formData.staffId}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Link to Login */}
          <p className="text-center mt-3 mb-0" style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Login here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Register;