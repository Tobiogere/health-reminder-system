import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';
import CreateStaffAccount from './CreateStaffAccount';

// ── Dummy Data (replace with API later) ──────────────────────
const initialUsers = [
  { id: 1, name: 'Chukwuemeka Obi',  identifier: 'STU/2024/001', role: 'patient',    patientType: 'student',  status: 'Active',    joined: '01 Jan 2026' },
  { id: 2, name: 'Amina Bello',       identifier: 'STU/2024/042', role: 'patient',    patientType: 'student',  status: 'Active',    joined: '03 Jan 2026' },
  { id: 3, name: 'Mr. Tunde Adeyemi', identifier: 'STF/2024/010', role: 'patient',    patientType: 'staff',    status: 'Active',    joined: '05 Jan 2026' },
  { id: 4, name: 'Grace Eze',         identifier: '08031234567',  role: 'patient',    patientType: 'external', status: 'Active',    joined: '10 Jan 2026' },
  { id: 5, name: 'Dr. Adebayo',       identifier: 'STF/2024/021', role: 'doctor',     patientType: null,       status: 'Active',    joined: '01 Jan 2026' },
  { id: 6, name: 'Dr. Okafor',        identifier: 'STF/2024/022', role: 'doctor',     patientType: null,       status: 'Active',    joined: '02 Jan 2026' },
  { id: 7, name: 'Pharm. Salako',     identifier: 'STF/2024/031', role: 'pharmacist', patientType: null,       status: 'Active',    joined: '01 Jan 2026' },
  { id: 8, name: 'Pharm. Nwosu',      identifier: 'STF/2024/032', role: 'pharmacist', patientType: null,       status: 'Suspended', joined: '15 Jan 2026' },
];
// ─────────────────────────────────────────────────────────────

const roleBadgeColors = {
  patient:    { bg: '#cfe2ff', color: '#084298' },
  doctor:     { bg: '#d1e7dd', color: '#0f5132' },
  pharmacist: { bg: '#e2d9f3', color: '#432874' },
  admin:      { bg: '#f8d7da', color: '#842029' },
};

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(window.innerWidth > 768);
  const [users, setUsers]               = useState(initialUsers);
  const [userSearch, setUserSearch]     = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.identifier.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (id) => {
    // TODO: Replace with API call — PATCH /admin/users/:id/status
    setUsers(users.map(u =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    ));
  };

  const handleCreateStaff = (staffData) => {
    // TODO: Replace with API call — POST /admin/users/staff
    const newUser = {
      id:          users.length + 1,
      name:        staffData.fullName,
      identifier:  staffData.staffId,
      role:        staffData.role,
      patientType: null,
      status:      'Active',
      joined:      new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
    };
    setUsers([...users, newUser]);
    setShowCreateStaff(false);
    alert(`Account created for ${staffData.fullName}`);
  };

  const totalPatients    = users.filter(u => u.role === 'patient').length;
  const totalDoctors     = users.filter(u => u.role === 'doctor').length;
  const totalPharmacists = users.filter(u => u.role === 'pharmacist').length;
  const totalSuspended   = users.filter(u => u.status === 'Suspended').length;

  // Show create staff form
  if (showCreateStaff) {
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
          <CreateStaffAccount
            onSubmit={handleCreateStaff}
            onCancel={() => setShowCreateStaff(false)}
          />
        </div>
      </div>
    );
  }

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
        <div
          className="d-flex justify-content-between align-items-start mb-4"
          style={{ flexWrap: 'wrap', gap: '0.75rem' }}
        >
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
              👥 Manage Users
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>
              View, search and manage all registered users
            </p>
          </div>
          <button
            onClick={() => setShowCreateStaff(true)}
            style={{
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.2rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            ➕ Create Staff Account
          </button>
        </div>

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d6efd' }}>
                {totalPatients}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Patients</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
                {totalDoctors}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Doctors</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
                {totalPharmacists}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pharmacists</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
                {totalSuspended}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Suspended</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-custom mb-3">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search name or ID..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <select
              className="form-select form-select-sm"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="all">All Roles</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>
        </div>

        {/* Users table */}
        <div className="card-custom">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Name', 'ID / Phone', 'Role', 'Type', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '0.6rem 0.75rem',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      borderBottom: '1px solid #e9ecef',
                      whiteSpace: 'nowrap',
                      textAlign: 'left',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--muted)' }}>{u.identifier}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span style={{
                        backgroundColor: roleBadgeColors[u.role].bg,
                        color:           roleBadgeColors[u.role].color,
                        borderRadius: '999px',
                        padding: '0.15rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textTransform: 'capitalize', color: 'var(--muted)' }}>
                      {u.patientType || '—'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>{u.joined}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span style={{
                        backgroundColor: u.status === 'Active' ? '#d1e7dd' : '#f8d7da',
                        color:           u.status === 'Active' ? '#0f5132' : '#842029',
                        borderRadius: '999px',
                        padding: '0.15rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        style={{
                          backgroundColor: u.status === 'Active' ? '#fff3cd' : '#d1e7dd',
                          color:           u.status === 'Active' ? '#856404' : '#0f5132',
                          border: '1px solid',
                          borderColor:     u.status === 'Active' ? '#ffc107' : '#b7ebc8',
                          borderRadius: '6px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {u.status === 'Active' ? '🔒 Suspend' : '🔓 Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem', fontSize: '0.85rem' }}>
                No users found.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;