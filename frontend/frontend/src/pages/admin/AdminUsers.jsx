import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import CreateStaffAccount from './CreateStaffAccount';

const roleBadgeColors = {
  patient:    { bg: '#cfe2ff', color: '#084298' },
  doctor:     { bg: '#d1e7dd', color: '#0f5132' },
  pharmacist: { bg: '#e2d9f3', color: '#432874' },
  admin:      { bg: '#f8d7da', color: '#842029' },
};

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen]         = useState(window.innerWidth > 768);
  const [users, setUsers]                     = useState([]);
  const [userSearch, setUserSearch]           = useState('');
  const [roleFilter, setRoleFilter]           = useState('all');
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [loading, setLoading]                 = useState(true);

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/admin-panel/users', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin-panel/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCreateStaff = async (staffData) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:    staffData.fullName,
          gender:      staffData.gender,
          phoneNumber: staffData.phone,
          role:        staffData.role,
          password:    staffData.password,
          staffId:     staffData.staffId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreateStaff(false);
        fetchUsers();
        alert(`Account created for ${staffData.fullName}`);
      } else {
        alert(data.message || 'Failed to create account.');
      }
    } catch (err) {
      alert('Could not connect to server.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name       || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.identifier || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPatients    = users.filter(u => u.role === 'patient').length;
  const totalDoctors     = users.filter(u => u.role === 'doctor').length;
  const totalPharmacists = users.filter(u => u.role === 'pharmacist').length;
  const totalSuspended   = users.filter(u => u.status === 'Suspended').length;

  if (showCreateStaff) {
    return (
      <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onCloseSidebar={() => setSidebarOpen(false)}>
        <CreateStaffAccount onSubmit={handleCreateStaff} onCancel={() => setShowCreateStaff(false)} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onCloseSidebar={() => setSidebarOpen(false)}>

      <div className="d-flex justify-content-between align-items-start mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>👥 Manage Users</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>View, search and manage all registered users</p>
        </div>
        <button onClick={() => setShowCreateStaff(true)} style={{
          backgroundColor: '#6B0F1A', color: '#fff', border: 'none',
          borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
        }}>➕ Create Staff Account</button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {[
              { label: 'Patients',    value: totalPatients,    color: '#C9A84C' },
              { label: 'Doctors',     value: totalDoctors,     color: '#198754' },
              { label: 'Pharmacists', value: totalPharmacists, color: '#6f42c1' },
              { label: 'Suspended',   value: totalSuspended,   color: '#fd7e14' },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="card-custom text-center" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-custom mb-3">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" className="form-control form-control-sm"
                placeholder="Search name or ID..." value={userSearch}
                onChange={e => setUserSearch(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
              <select className="form-select form-select-sm" value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)} style={{ width: '140px' }}>
                <option value="all">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="card-custom">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    {['Name', 'ID / Phone', 'Role', 'Type', 'Joined', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid #e9ecef', whiteSpace: 'nowrap', textAlign: 'left' }}>{h}</th>
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
                          backgroundColor: roleBadgeColors[u.role]?.bg || '#e2e3e5',
                          color: roleBadgeColors[u.role]?.color || '#41464b',
                          borderRadius: '999px', padding: '0.15rem 0.6rem',
                          fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textTransform: 'capitalize', color: 'var(--muted)' }}>
                        {u.patientType || '—'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>
                        {new Date(u.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{
                          backgroundColor: u.status === 'Active' ? '#d1e7dd' : '#f8d7da',
                          color: u.status === 'Active' ? '#0f5132' : '#842029',
                          borderRadius: '999px', padding: '0.15rem 0.6rem',
                          fontSize: '0.72rem', fontWeight: 600,
                        }}>{u.status}</span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <button onClick={() => handleToggleStatus(u.id, u.status)} style={{
                          backgroundColor: u.status === 'Active' ? '#fff3cd' : '#d1e7dd',
                          color: u.status === 'Active' ? '#856404' : '#0f5132',
                          border: '1px solid',
                          borderColor: u.status === 'Active' ? '#ffc107' : '#b7ebc8',
                          borderRadius: '6px', padding: '0.25rem 0.65rem',
                          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>
                          {u.status === 'Active' ? '🔒 Suspend' : '🔓 Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem', fontSize: '0.85rem' }}>No users found.</p>
              )}
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default AdminUsers;