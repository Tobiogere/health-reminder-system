import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useWindowSize from '../hooks/useWindowSize';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const { user, login }             = useAuth();
//   const navigate                    = useNavigate();
  const windowWidth                 = useWindowSize();
  const isMobile                    = windowWidth <= 768;
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const [formData, setFormData] = useState({
    fullName:        user?.name        || '',
    phone:           user?.phone       || '',
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const roleColors = {
    patient:    '#C9A84C',
    doctor:     '#198754',
    pharmacist: '#6f42c1',
    admin:      '#6B0F1A',
  };
  const roleColor = roleColors[user?.role] || '#0d6efd';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }
    try {
      setLoading(true);
      // TODO: Replace with API call — PATCH /users/profile
      await new Promise(resolve => setTimeout(resolve, 800));
      login({ ...user, name: formData.fullName });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (!formData.newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      // TODO: Replace with API call — PATCH /users/password
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccess('Password changed successfully.');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{
        marginLeft: sidebarOpen && !isMobile ? '220px' : '0px',
        marginTop: '60px',
        padding: '1.5rem',
        transition: 'margin-left 0.25s ease',
      }}>

        {/* Header */}
        <div className="mb-4">
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
            👤 My Profile
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            View and update your account information
          </p>
        </div>

        <div className="row g-3">

          {/* Left — Profile card */}
          <div className="col-12 col-lg-4">
            <div className="card-custom text-center" style={{ padding: '2rem' }}>
              {/* Avatar */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: roleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1rem auto',
                color: '#fff',
                fontWeight: 700,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <h5 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{user?.name}</h5>

              <span style={{
                display: 'inline-block',
                backgroundColor: roleColor + '20',
                color: roleColor,
                borderRadius: '999px',
                padding: '0.2rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}>
                {user?.role}
              </span>

              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 2 }}>
                <div>🪪 {user?.identifier}</div>
                {user?.patientType && (
                  <div style={{ textTransform: 'capitalize' }}>
                    👤 {user.patientType} patient
                  </div>
                )}
                {user?.department && <div>🏫 {user.department}</div>}
              </div>
            </div>
          </div>

          {/* Right — Edit forms */}
          <div className="col-12 col-lg-8">

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.25rem',
              marginBottom: '1rem',
              borderBottom: '2px solid #e9ecef',
            }}>
              {[
                { key: 'info',     label: '📋 Personal Info'   },
                { key: 'password', label: '🔒 Change Password' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? `2px solid ${roleColor}` : '2px solid transparent',
                    marginBottom: '-2px',
                    padding: '0.5rem 1rem',
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    color: activeTab === tab.key ? roleColor : 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="card-custom">
              {error && (
                <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.82rem' }}>
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.82rem' }}>
                  ✅ {success}
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'info' && (
                <form onSubmit={handleUpdateInfo} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control form-control-sm"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control form-control-sm"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 08012345678"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      ID / Identifier
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={user?.identifier || ''}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                    <small style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                      ID cannot be changed. Contact admin if needed.
                    </small>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: roleColor,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1.5rem',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-control form-control-sm"
                      placeholder="Enter current password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-control form-control-sm"
                      placeholder="Minimum 6 characters"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control form-control-sm"
                      placeholder="Repeat new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: roleColor,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1.5rem',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Updating...' : '🔒 Change Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;