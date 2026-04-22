import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    patient:    '#C9A84C',   // Gold
    doctor:     '#198754',   // Green
    pharmacist: '#6f42c1',   // Purple
    admin:      '#6B0F1A',   // Maroon
  };

  const roleColor = user ? roleColors[user.role] : '#0d6efd';

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: `3px solid ${roleColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Left — hamburger + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.3rem',
            cursor: 'pointer',
            color: '#495057',
            padding: '0.2rem 0.4rem',
            lineHeight: 1,
          }}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {/* Clickable logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#212529' }}
  className="hide-mobile"
>
  RUN Med Reminder
</span>
<span
  style={{ fontWeight: 700, fontSize: '0.9rem', color: '#212529' }}
  className="d-inline d-sm-none"
>
  RUN
</span>
        </Link>
      </div>

      {/* Right — user info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Notification bell — patients only */}
        {user && user.role === 'patient' && <NotificationBell />}

        {/* Name + role — hidden on mobile */}
        {user && (
          <div style={{ textAlign: 'right' }} className="hide-mobile">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#212529' }}>
              {user.name}
            </div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: roleColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {user.role}
            </div>
          </div>
        )}

        {/* Role badge */}
        {user && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: roleColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: `1px solid ${roleColor}`,
            borderRadius: '999px',
            padding: '0.15rem 0.5rem',
          }}>
            {user.role}
          </span>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '0.35rem 0.7rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#495057',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#dc3545';
            e.target.style.color = '#fff';
            e.target.style.borderColor = '#dc3545';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.color = '#495057';
            e.target.style.borderColor = '#dee2e6';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;