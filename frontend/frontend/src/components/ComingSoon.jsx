import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title, icon }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon || '🚧'}</div>
      <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{title || 'Coming Soon'}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        This page is under construction and will be available soon.
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: '#0d6efd',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '0.5rem 1.5rem',
          fontWeight: 600,
          fontSize: '0.88rem',
          cursor: 'pointer',
        }}
      >
        ← Go Back
      </button>
    </div>
  );
};

export default ComingSoon;