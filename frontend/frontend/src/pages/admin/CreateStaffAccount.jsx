import React, { useState } from 'react';

const CreateStaffAccount = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName:  '',
    gender:    '',
    phone:     '',
    role:      '',
    staffId:   '',
    password:  '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    const { fullName, gender, phone, role, staffId, password, confirmPassword } = formData;
    if (!fullName || !gender || !phone || !role || !staffId || !password || !confirmPassword)
      return 'Please fill in all fields.';
    if (password !== confirmPassword)
      return 'Passwords do not match.';
    if (password.length < 6)
      return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(formData);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '0.3rem 0.7rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
            ➕ Create Staff Account
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0 }}>
            Create an account for a Doctor or Pharmacist
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '480px' }}>
        <div className="card-custom">
          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-control form-control-sm"
                placeholder="e.g. Dr. John Adebayo"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>Gender</label>
              <select name="gender" className="form-select form-select-sm" value={formData.gender} onChange={handleChange}>
                <option value="">-- Select gender --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control form-control-sm"
                placeholder="e.g. 08012345678"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Role */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>Role</label>
              <select name="role" className="form-select form-select-sm" value={formData.role} onChange={handleChange}>
                <option value="">-- Select role --</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>

            {/* Staff ID */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>Staff ID</label>
              <input
                type="text"
                name="staffId"
                className="form-control form-control-sm"
                placeholder="e.g. STF/2024/055"
                value={formData.staffId}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>Password</label>
              <input
                type="password"
                name="password"
                className="form-control form-control-sm"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control form-control-sm"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                ✅ Create Account
              </button>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStaffAccount;