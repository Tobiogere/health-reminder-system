import React, { useState } from 'react';
import '../../styles/global.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // We'll wire this to the API in Step 4
    setLoading(true);
    console.log('Login submitted:', formData);
  };

  return (
    <div
      className="page-wrapper d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #E8F4F8 0%, #F4FAF7 100%)', minHeight: '100vh' }}
    >
      <div style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}>

        {/* Logo / Brand */}
        <div className="text-center mb-4">
          <div
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary)', margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {/* Simple cross icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="10" y="4" width="4" height="16" rx="2" fill="white"/>
              <rect x="4" y="10" width="16" height="4" rx="2" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
            UniHealth Centre
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Medication & Prescription Portal
          </p>
        </div>

        {/* Card */}
        <div className="card-custom">
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: 'var(--text-dark)' }}>
            Sign in
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Enter your credentials to access your dashboard.
          </p>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: '#FEE2E2', color: 'var(--danger)',
                padding: '10px 14px', borderRadius: 8,
                fontSize: 13, marginBottom: 16
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                Username / ID
              </label>
              <input
                type="text"
                name="username"
                className="form-control-custom"
                placeholder="Enter your matric no., staff ID, or username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control-custom"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary-custom w-100"
              disabled={loading}
              style={{ width: '100%', padding: '11px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            New patient?{' '}
            <a href="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>
              Register here
            </a>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
          University Health Centre © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;