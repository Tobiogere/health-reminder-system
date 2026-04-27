import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const patientLinks = [
  { to: '/patient/dashboard', label: 'Dashboard',            icon: '🏠' },
  { to: '/patient/schedule',  label: 'My Schedule',          icon: '📅' },
  { to: '/patient/history',   label: 'Prescription History', icon: '📋' },
  { to: '/patient/renewal',   label: 'Request Renewal',      icon: '🔄' },
  { to: '/profile',           label: 'My Profile',           icon: '👤' },
];

const doctorLinks = [
  { to: '/doctor/dashboard',     label: 'Dashboard',        icon: '🏠' },
  { to: '/doctor/search',        label: 'Search Patient',   icon: '🔍' },
  { to: '/doctor/prescriptions', label: 'My Prescriptions', icon: '📋' },
  { to: '/profile',           label: 'My Profile',           icon: '👤' },
];

const pharmacistLinks = [
  { to: '/pharmacist/dashboard', label: 'Dashboard',          icon: '🏠' },
  { to: '/pharmacist/queue',     label: 'Prescription Queue', icon: '📋' },
  { to: '/pharmacist/renewals',  label: 'Renewal Requests',   icon: '🔄' },
  { to: '/profile',           label: 'My Profile',           icon: '👤' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard',    icon: '🏠' },
  { to: '/admin/users',     label: 'Manage Users', icon: '👥' },
  { to: '/admin/drugs',        label: 'Drug Suggestions', icon: '💊' },
  { to: '/profile',           label: 'My Profile',           icon: '👤' },
];

const roleLinks = {
  patient:    patientLinks,
  doctor:     doctorLinks,
  pharmacist: pharmacistLinks,
  admin:      adminLinks,
};

const roleColors = {
  patient:    '#C9A84C',
  doctor:     '#198754',
  pharmacist: '#6f42c1',
  admin:      '#6B0F1A',
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // ── All hooks MUST come before any early return ──
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Early return AFTER all hooks
  if (!user) return null;

  const links       = roleLinks[user.role] || [];
  const activeColor = roleColors[user.role];

  return (
    <>
      {/* Dark overlay — mobile only, when sidebar is open */}
      {isOpen && isMobile && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar panel */}
      <div
        style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          bottom: 0,
          width: isOpen ? '220px' : '0px',
          overflow: 'hidden',
          backgroundColor: '#1e2a38',
          transition: 'width 0.25s ease',
          zIndex: 999,
          boxShadow: isOpen ? '2px 0 8px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div style={{ width: '220px', padding: '1rem 0' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => {
                if (isMobile && onClose) onClose();
              }}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.2rem',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#ffffff' : '#adb5bd',
                backgroundColor: isActive ? activeColor : 'transparent',
                borderLeft: isActive ? '4px solid #ffffff' : '4px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <span style={{ fontSize: '1rem' }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;