import React, { useState } from 'react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    patient_type: 'student',  // student | staff | external
    matric_number: '',
    staff_id: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="page-wrapper d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #E8F4F8 0%, #F4FAF7 100%)', minHeight: '100vh', padding: '2rem 1rem' }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Create Patient Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Register to access your health records & medication reminders</p>
        </div>

        <div className="card-custom">
          <form>
            <div className="mb-3">
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Full Name</label>
              <input
                type="text" name="full_name"
                className="form-control-custom"
                placeholder="e.g. Amara Johnson"
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Email Address</label>
              <input
                type="email" name="email"
                className="form-control-custom"
                placeholder="you@example.com"
                onChange={handleChange}
              />
            </div>

            {/* Patient Type Selector */}
            <div className="mb-3">
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Patient Type</label>
              <select
                name="patient_type"
                className="form-control-custom"
                onChange={handleChange}
                value={formData.patient_type}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="external">External / Guest</option>
              </select>
            </div>

            {/* Conditional ID Fields */}
            {formData.patient_type === 'student' && (
              <div className="mb-3">
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Matric Number</label>
                <input
                  type="text" name="matric_number"
                  className="form-control-custom"
                  placeholder="e.g. 210901001"
                  onChange={handleChange}
                />
              </div>
            )}

            {formData.patient_type === 'staff' && (
              <div className="mb-3">
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Staff ID</label>
                <input
                  type="text" name="staff_id"
                  className="form-control-custom"
                  placeholder="e.g. STF-2041"
                  onChange={handleChange}
                />
              </div>
            )}

            {formData.patient_type === 'external' && (
              <div
                style={{
                  background: 'var(--primary-light)', padding: '10px 14px',
                  borderRadius: 8, fontSize: 12, color: 'var(--primary)', marginBottom: 12
                }}
              >
                An ID will be generated for you automatically after registration.
              </div>
            )}

            <div className="mb-4">
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Password</label>
              <input
                type="password" name="password"
                className="form-control-custom"
                placeholder="Create a strong password"
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary-custom" style={{ width: '100%', padding: '11px' }}>
              Create Account
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16, marginBottom: 0 }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;