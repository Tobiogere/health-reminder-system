import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import CreateStaffAccount from './CreateStaffAccount';
import PageWrapper from '../../components/PageWrapper';

// ── Dummy Data (replace with API later) ──────────────────────
const allUsers = [
  { id: 1, name: 'Chukwuemeka Obi',  identifier: 'STU/2024/001', role: 'patient',    patientType: 'student',  status: 'Active',    joined: '01 Jan 2026' },
  { id: 2, name: 'Amina Bello',       identifier: 'STU/2024/042', role: 'patient',    patientType: 'student',  status: 'Active',    joined: '03 Jan 2026' },
  { id: 3, name: 'Mr. Tunde Adeyemi', identifier: 'STF/2024/010', role: 'patient',    patientType: 'staff',    status: 'Active',    joined: '05 Jan 2026' },
  { id: 4, name: 'Grace Eze',         identifier: '08031234567',  role: 'patient',    patientType: 'external', status: 'Active',    joined: '10 Jan 2026' },
  { id: 5, name: 'Dr. Adebayo',       identifier: 'STF/2024/021', role: 'doctor',     patientType: null,       status: 'Active',    joined: '01 Jan 2026' },
  { id: 6, name: 'Dr. Okafor',        identifier: 'STF/2024/022', role: 'doctor',     patientType: null,       status: 'Active',    joined: '02 Jan 2026' },
  { id: 7, name: 'Pharm. Salako',     identifier: 'STF/2024/031', role: 'pharmacist', patientType: null,       status: 'Active',    joined: '01 Jan 2026' },
  { id: 8, name: 'Pharm. Nwosu',      identifier: 'STF/2024/032', role: 'pharmacist', patientType: null,       status: 'Suspended', joined: '15 Jan 2026' },
];

const drugSuggestions = [
  { id: 1, drug: 'Artemether 80mg',         suggestedBy: 'Dr. Adebayo', date: '19 Apr 2026', status: 'Pending'  },
  { id: 2, drug: 'Cefuroxime 250mg',        suggestedBy: 'Dr. Okafor',  date: '18 Apr 2026', status: 'Pending'  },
  { id: 3, drug: 'Tramadol Injection 50mg', suggestedBy: 'Dr. Adebayo', date: '17 Apr 2026', status: 'Approved' },
];

const allPrescriptions = [
  { id: 1, patient: 'Chukwuemeka Obi', doctor: 'Dr. Adebayo', diagnosis: 'Malaria',   drugs: 'Paracetamol, Coartem',   date: '18 Apr 2026', status: 'Processed' },
  { id: 2, patient: 'Amina Bello',     doctor: 'Dr. Okafor',  diagnosis: 'Typhoid',   drugs: 'Ciprofloxacin, ORS',     date: '18 Apr 2026', status: 'Pending'   },
  { id: 3, patient: 'Grace Eze',       doctor: 'Dr. Adebayo', diagnosis: 'Upper RTI', drugs: 'Amoxicillin, Vitamin C', date: '17 Apr 2026', status: 'Processed' },
];

const allRenewals = [
  { id: 1, patient: 'Chukwuemeka Obi', drug: 'Paracetamol 500mg', date: '18 Apr 2026', status: 'Pending'  },
  { id: 2, patient: 'Grace Eze',       drug: 'Vitamin C 1000mg',  date: '17 Apr 2026', status: 'Approved' },
];

const activityLog = [
  { id: 1, time: '18 Apr 2026, 10:32 AM', event: 'Dr. Adebayo wrote a prescription for Chukwuemeka Obi', type: 'prescription' },
  { id: 2, time: '18 Apr 2026, 10:15 AM', event: 'Pharm. Salako processed prescription for Grace Eze',   type: 'pharmacy'     },
  { id: 3, time: '18 Apr 2026, 09:50 AM', event: 'Chukwuemeka Obi requested a medication renewal',       type: 'renewal'      },
  { id: 4, time: '17 Apr 2026, 03:12 PM', event: 'New patient registered: Amina Bello',                  type: 'registration' },
  { id: 5, time: '17 Apr 2026, 02:45 PM', event: 'Pharm. Nwosu account suspended by Admin',              type: 'admin'        },
];

const missedDosesReport = [
  { id: 1, patientName: 'Chukwuemeka Obi', patientId: 'STU/2024/001', drug: 'Paracetamol 500mg',   missedCount: 3, lastMissed: '19 Apr 2026', doctor: 'Dr. Adebayo' },
  { id: 2, patientName: 'Grace Eze',       patientId: '08031234567',  drug: 'Amoxicillin 500mg',   missedCount: 2, lastMissed: '19 Apr 2026', doctor: 'Dr. Adebayo' },
  { id: 3, patientName: 'Amina Bello',     patientId: 'STU/2024/042', drug: 'Ciprofloxacin 500mg', missedCount: 1, lastMissed: '18 Apr 2026', doctor: 'Dr. Okafor'  },
];

const roleBadgeColors = {
  patient:    { bg: '#cfe2ff', color: '#084298' },
  doctor:     { bg: '#d1e7dd', color: '#0f5132' },
  pharmacist: { bg: '#e2d9f3', color: '#432874' },
  admin:      { bg: '#f8d7da', color: '#842029' },
};

const activityIcons = {
  prescription: '📋',
  pharmacy:     '💊',
  renewal:      '🔄',
  registration: '👤',
  admin:        '⚙️',
};
// ─────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user }                              = useAuth();
  const [sidebarOpen, setSidebarOpen]         = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab]             = useState('overview');
  const [users, setUsers]                     = useState(allUsers);
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [userSearch, setUserSearch]           = useState('');
  const [roleFilter, setRoleFilter]           = useState('all');
  const [suggestions, setSuggestions]         = useState(drugSuggestions);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleToggleStatus = (id) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    ));
  };

  const handleCreateStaff = (staffData) => {
    const newUser = {
      id:          users.length + 1,
      name:        staffData.fullName,
      identifier:  staffData.staffId,
      role:        staffData.role,
      patientType: null,
      status:      'Active',
      joined:      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setUsers([...users, newUser]);
    setShowCreateStaff(false);
    alert(`Account created for ${staffData.fullName}`);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.identifier.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers       = users.length;
  const totalPatients    = users.filter(u => u.role === 'patient').length;
  const totalDoctors     = users.filter(u => u.role === 'doctor').length;
  const totalPharmacists = users.filter(u => u.role === 'pharmacist').length;
  const activeUsers      = users.filter(u => u.status === 'Active').length;
  const suspendedUsers   = users.filter(u => u.status === 'Suspended').length;

  const tabs = [
    { key: 'overview',      label: '📊 Overview'        },
    { key: 'users',         label: '👥 Users'            },
    { key: 'prescriptions', label: '📋 Prescriptions'    },
    { key: 'renewals',      label: '🔄 Renewals'         },
    { key: 'activity',      label: '🕐 Activity Log'     },
    { key: 'drugs',         label: `💊 Drug Suggestions${suggestions.filter(s => s.status === 'Pending').length > 0 ? ` (${suggestions.filter(s => s.status === 'Pending').length})` : ''}` },
    { key: 'missed',        label: `⚠️ Missed Doses (${missedDosesReport.length})` },
  ];

  // Show create staff form
  if (showCreateStaff) {
    return (
      <PageWrapper
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={() => setSidebarOpen(false)}
      >
        <CreateStaffAccount
          onSubmit={handleCreateStaff}
          onCancel={() => setShowCreateStaff(false)}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* ── Welcome Header ── */}
      <div className="d-flex justify-content-between align-items-start mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
            Welcome, {user?.name} ⚙️
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>{today}</p>
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

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.2rem', borderBottom: '2px solid #e9ecef', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #dc3545' : '2px solid transparent',
              marginBottom: '-2px',
              padding: '0.5rem 0.9rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? '#dc3545' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === 'overview' && (
        <>
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Users',      value: totalUsers,       color: '#dc3545' },
              { label: 'Patients',         value: totalPatients,    color: '#C9A84C' },
              { label: 'Doctors',          value: totalDoctors,     color: '#198754' },
              { label: 'Pharmacists',      value: totalPharmacists, color: '#6f42c1' },
              { label: 'Active Accounts',  value: activeUsers,      color: '#198754' },
              { label: 'Suspended',        value: suspendedUsers,   color: '#fd7e14' },
              { label: 'Prescriptions',    value: allPrescriptions.length, color: '#C9A84C' },
              { label: 'Pending Renewals', value: allRenewals.filter(r => r.status === 'Pending').length, color: '#ffc107' },
            ].map(stat => (
              <div key={stat.label} className="col-6 col-md-3">
                <div className="card-custom text-center" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-custom">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
              🕐 Recent Activity
            </h5>
            {activityLog.slice(0, 3).map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #e9ecef', fontSize: '0.82rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem' }}>{activityIcons[log.type]}</span>
                <div>
                  <div>{log.event}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{log.time}</div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setActiveTab('activity')}
              style={{ background: 'none', border: 'none', color: '#dc3545', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.75rem', padding: 0 }}
            >
              View all activity →
            </button>
          </div>
        </>
      )}

      {/* ══ USERS TAB ══ */}
      {activeTab === 'users' && (
        <div className="card-custom">
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>👥 All Users</h5>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search name or ID..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ width: '180px' }}
              />
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                style={{ width: '130px' }}
              >
                <option value="all">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Name', 'ID / Phone', 'Role', 'Type', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid #e9ecef', whiteSpace: 'nowrap', textAlign: 'left' }}>
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
                        color: roleBadgeColors[u.role].color,
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
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '1.5rem', fontSize: '0.85rem' }}>
                No users found.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══ PRESCRIPTIONS TAB ══ */}
      {activeTab === 'prescriptions' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📋 All Prescriptions</h5>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Patient', 'Doctor', 'Diagnosis', 'Drugs', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid #e9ecef', whiteSpace: 'nowrap', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPrescriptions.map(rx => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{rx.patient}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{rx.doctor}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{rx.diagnosis}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--muted)' }}>{rx.drugs}</td>
                    <td style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>{rx.date}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span style={{
                        backgroundColor: rx.status === 'Processed' ? '#d1e7dd' : '#fff3cd',
                        color:           rx.status === 'Processed' ? '#0f5132' : '#856404',
                        borderRadius: '999px',
                        padding: '0.15rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}>
                        {rx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ RENEWALS TAB ══ */}
      {activeTab === 'renewals' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔄 All Renewal Requests</h5>
          {allRenewals.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #e9ecef', backgroundColor: '#fff', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.patient}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>💊 {r.drug} · {r.date}</div>
              </div>
              <span style={{
                backgroundColor: r.status === 'Approved' ? '#d1e7dd' : r.status === 'Pending' ? '#fff3cd' : '#f8d7da',
                color:           r.status === 'Approved' ? '#0f5132' : r.status === 'Pending' ? '#856404' : '#842029',
                borderRadius: '999px',
                padding: '0.2rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ══ ACTIVITY LOG TAB ══ */}
      {activeTab === 'activity' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🕐 System Activity Log</h5>
          {activityLog.map((log, i) => (
            <div key={log.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: i < activityLog.length - 1 ? '1px solid #e9ecef' : 'none', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                {activityIcons[log.type]}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{log.event}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{log.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ DRUG SUGGESTIONS TAB ══ */}
      {activeTab === 'drugs' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
            💊 Drug Suggestions from Doctors
          </h5>
          {suggestions.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No drug suggestions at this time.</p>
          ) : (
            suggestions.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', marginBottom: '0.6rem', borderRadius: '8px', border: `1px solid ${s.status === 'Approved' ? '#b7ebc8' : '#ffc107'}`, backgroundColor: s.status === 'Approved' ? '#f0fff4' : '#fffdf0', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.2rem' }}>🆕 {s.drug}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Suggested by {s.suggestedBy} · {s.date}</div>
                </div>
                {s.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setSuggestions(suggestions.map(sg => sg.id === s.id ? { ...sg, status: 'Approved' } : sg))} style={{ backgroundColor: '#198754', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.85rem', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                      ✅ Add to List
                    </button>
                    <button onClick={() => setSuggestions(suggestions.map(sg => sg.id === s.id ? { ...sg, status: 'Rejected' } : sg))} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.85rem', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                      ❌ Dismiss
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: '#198754', fontWeight: 700 }}>✅ Added to List</span>
                )}
              </div>
            ))
          )}
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#f8f9ff', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--muted)', border: '1px solid #e9ecef' }}>
            ℹ️ Approved drugs will be permanently added to the prescription drug list in the next system update.
          </div>
        </div>
      )}

      {/* ══ MISSED DOSES TAB ══ */}
      {activeTab === 'missed' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>⚠️ Missed Doses Report</h5>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Patient', 'ID', 'Drug', 'Missed Count', 'Last Missed', 'Doctor'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid #e9ecef', whiteSpace: 'nowrap', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {missedDosesReport.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{m.patientName}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--muted)' }}>{m.patientId}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{m.drug}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span style={{
                        backgroundColor: m.missedCount >= 3 ? '#f8d7da' : '#fff3cd',
                        color:           m.missedCount >= 3 ? '#842029' : '#856404',
                        borderRadius: '999px',
                        padding: '0.15rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        {m.missedCount}x missed
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>{m.lastMissed}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{m.doctor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </PageWrapper>
  );
};

export default AdminDashboard;