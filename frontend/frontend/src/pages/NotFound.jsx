import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const dashboards = {
      patient:    '/patient/dashboard',
      doctor:     '/doctor/dashboard',
      pharmacist: '/pharmacist/dashboard',
      admin:      '/admin/dashboard',
    };
    navigate(dashboards[user.role]);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏥</div>
      <h1 style={{ fontSize: '5rem', fontWeight: 900, color: '#dee2e6', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '2rem', maxWidth: '360px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={handleGoHome}
        style={{
          backgroundColor: '#0d6efd',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '0.6rem 1.8rem',
          fontWeight: 700,
          fontSize: '0.88rem',
          cursor: 'pointer',
        }}
      >
        {user ? '← Back to Dashboard' : '← Back to Login'}
      </button>
    </div>
  );
};

export default NotFound;