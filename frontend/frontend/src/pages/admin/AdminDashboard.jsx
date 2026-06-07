import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import CreateStaffAccount from './CreateStaffAccount';
import PageWrapper from '../../components/PageWrapper';

const roleBadgeColors = {
  patient:    { bg: '#cfe2ff', color: '#084298' },
  doctor:     { bg: '#d1e7dd', color: '#0f5132' },
  pharmacist: { bg: '#e2d9f3', color: '#432874' },
  admin:      { bg: '#f8d7da', color: '#842029' },
};

const AdminDashboard = () => {
  const { user }                              = useAuth();
  const [sidebarOpen, setSidebarOpen]         = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab]             = useState('overview');
  const [showCreateStaff, setShowCreateStaff] = useState(false);

  const [users, setUsers]                 = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [renewals, setRenewals]           = useState([]);
  const [loading, setLoading]             = useState(true);

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const token = localStorage.getItem('token');
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, prescRes, renewRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/admin-panel/users', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch('http://127.0.0.1:8000/prescriptions/all', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch('http://127.0.0.1:8000/renewals/', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      ]);
      const usersData = await usersRes.json();
      const prescData = await prescRes.json();
      const renewData = await renewRes.json();
      if (usersRes.ok && Array.isArray(usersData)) setUsers(usersData);
      if (prescRes.ok && Array.isArray(prescData)) setPrescriptions(prescData);
      if (renewRes.ok && Array.isArray(renewData)) setRenewals(renewData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

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
        fetchData();
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
  const activeUsers      = users.filter(u => u.status === 'Active').length;
  const suspendedUsers   = users.filter(u => u.status === 'Suspended').length;
  const pendingRenewals  = renewals.filter(r => r.status === 'pending').length;

  const tabs = [
    { key: 'overview',      label: '📊 Overview'     },
    { key: 'users',         label: '👥 Users'         },
    { key: 'prescriptions', label: '📋 Prescriptions' },
    { key: 'renewals',      label: '🔄 Renewals'      },
  ];

  if (showCreateStaff) {
    return (
      <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>
        <CreateStaffAccount onSubmit={handleCreateStaff} onCancel={() => setShowCreateStaff(false)} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
            Welcome, {user?.name} ⚙️
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>{today}</p>
        </div>
        <button onClick={() => setShowCreateStaff(true)} style={{
          backgroundColor: '#6B0F1A', color: '#fff', border: 'none',
          borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
        }}>➕ Create Staff Account</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.2rem', borderBottom: '2px solid #e9ecef', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === tab.key ? '2px solid #6B0F1A' : '2px solid transparent',
            marginBottom: '-2px', padding: '0.5rem 0.9rem',
            fontWeight: activeTab === tab.key ? 700 : 500,
            color: activeTab === tab.key ? '#6B0F1A' : 'var(--muted)',
            cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading admin data...</p>
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="row g-3 mb-4">
                {[
                  { label: 'Total Users',      value: users.length,    color: '#6B0F1A' },
                  { label: 'Patients',         value: totalPatients,   color: '#C9A84C' },
                  { label: 'Doctors',          value: totalDoctors,    color: '#198754' },
                  { label: 'Pharmacists',      value: totalPharmacists,color: '#6f42c1' },
                  { label: 'Active Accounts',  value: activeUsers,     color: '#198754' },
                  { label: 'Suspended',        value: suspendedUsers,  color: '#fd7e14' },
                  { label: 'Prescriptions',    value: prescriptions.length, color: '#C9A84C' },
                  { label: 'Pending Renewals', value: pendingRenewals, color: '#ffc107' },
                ].map(stat => (
                  <div key={stat.label} className="col-6 col-md-3">
                    <div className="card-custom text-center" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recently Joined Users */}
              <div className="card-custom">
                <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>👥 Recently Joined Users</h5>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0', borderBottom: '1px solid #e9ecef', fontSize: '0.82rem',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                      <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>{u.identifier}</span>
                    </div>
                    <span style={{
                      backgroundColor: roleBadgeColors[u.role]?.bg || '#e2e3e5',
                      color: roleBadgeColors[u.role]?.color || '#41464b',
                      borderRadius: '999px', padding: '0.15rem 0.6rem',
                      fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                    }}>{u.role}</span>
                  </div>
                ))}
                <button onClick={() => setActiveTab('users')} style={{
                  background: 'none', border: 'none', color: '#6B0F1A',
                  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.75rem', padding: 0,
                }}>View all users →</button>
              </div>
            </>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="card-custom">
              <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>👥 All Users</h5>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input type="text" className="form-control form-control-sm"
                    placeholder="Search name or ID..." value={userSearch}
                    onChange={e => setUserSearch(e.target.value)} style={{ width: '180px' }} />
                  <select className="form-select form-select-sm" value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)} style={{ width: '130px' }}>
                    <option value="all">All Roles</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      {['Name', 'ID', 'Role', 'Type', 'Joined', 'Status', 'Action'].map(h => (
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
          )}

          {/* PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div className="card-custom">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📋 All Prescriptions</h5>
              {prescriptions.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No prescriptions found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        {['Patient', 'Doctor', 'Diagnosis', 'Drug', 'Dosage', 'Date', 'Status'].map(h => (
                          <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid #e9ecef', whiteSpace: 'nowrap', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map(rx => (
                        <tr key={rx.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{rx.patientName}</td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>{rx.doctorName || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>{rx.diagnosis}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: 'var(--muted)' }}>{rx.medicationName}</td>
                          <td style={{ padding: '0.65rem 0.75rem', color: 'var(--muted)' }}>{rx.dosage || '—'}</td>
                          <td style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>
                            {new Date(rx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            <span style={{
                              backgroundColor: rx.status === 'active' ? '#d1e7dd' : rx.status === 'pending' ? '#fff3cd' : '#f8d7da',
                              color: rx.status === 'active' ? '#0f5132' : rx.status === 'pending' ? '#856404' : '#842029',
                              borderRadius: '999px', padding: '0.15rem 0.6rem',
                              fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                            }}>{rx.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RENEWALS TAB */}
          {activeTab === 'renewals' && (
            <div className="card-custom">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔄 All Renewal Requests</h5>
              {renewals.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No renewal requests found.</p>
              ) : (
                renewals.map(r => (
                  <div key={r.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '8px',
                    border: '1px solid #e9ecef', backgroundColor: '#fff',
                    flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                        💊 {r.drug} · {new Date(r.requestDate).toLocaleDateString('en-GB')}
                      </div>
                      {r.note && <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>📝 {r.note}</div>}
                    </div>
                    <span style={{
                      backgroundColor: r.status === 'approved' ? '#d1e7dd' : r.status === 'pending' ? '#fff3cd' : '#f8d7da',
                      color: r.status === 'approved' ? '#0f5132' : r.status === 'pending' ? '#856404' : '#842029',
                      borderRadius: '999px', padding: '0.2rem 0.75rem',
                      fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                    }}>{r.status}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default AdminDashboard;