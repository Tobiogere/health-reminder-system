import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import NewPrescription from './NewPrescription';
import MissedDoseAlert from '../../components/MissedDoseAlert';
import PageWrapper from '../../components/PageWrapper';

// ── Group prescriptions by patient + diagnosis + date ──
const groupPrescriptions = (prescriptions) => {
  const groups = {};
  prescriptions.forEach(rx => {
    const date = new Date(rx.createdAt).toLocaleDateString('en-GB');
    const key  = `${rx.patientId}-${rx.diagnosis}-${date}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        patientName: rx.patientName,
        patientId:   rx.patientId,
        diagnosis:   rx.diagnosis,
        date,
        status:      rx.status,
        createdAt:   rx.createdAt,
        drugs:       [],
      };
    }
    groups[key].drugs.push({
      id:             rx.id,
      medicationName: rx.medicationName,
      status:         rx.status,
    });
    // If any drug is pending, group is pending
    if (rx.status === 'pending') groups[key].status = 'pending';
    // If any drug is active, group is active (unless pending)
    if (rx.status === 'active' && groups[key].status !== 'pending') groups[key].status = 'active';
  });
  return Object.values(groups);
};

const DoctorDashboard = () => {
  const { user }                              = useAuth();
  const [sidebarOpen, setSidebarOpen]         = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResult, setSearchResult]       = useState(null);
  const [searchError, setSearchError]         = useState('');
  const [searching, setSearching]             = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions]     = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);

  const token = localStorage.getItem('token');
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const fetchPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`http://127.0.0.1:8000/prescriptions/doctor/${storedUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setPrescriptions(data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPrescriptions(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    const query = searchQuery.trim();
    if (!query) { setSearchError('Please enter a Patient ID or matric number.'); return; }
    try {
      setSearching(true);
      const res = await fetch(`http://127.0.0.1:8000/patients/search?identifier=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) setSearchResult(data);
      else setSearchError(data.message || 'No patient found with that ID.');
    } catch (err) {
      setSearchError('Could not connect to server. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handlePrescriptionSubmit = async (prescriptionData) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/prescriptions/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId:  searchResult.id,
          diagnosis:  prescriptionData.diagnosis,
          drugs:      prescriptionData.drugs,
          notes:      prescriptionData.notes,
          doctorName: user?.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedPatient(null);
        setSearchResult(null);
        setSearchQuery('');
        fetchPrescriptions();
        alert(`Prescription for ${prescriptionData.patientName} sent to pharmacy successfully.`);
      } else {
        alert(data.message || 'Failed to submit prescription.');
      }
    } catch (err) {
      alert('Could not connect to server. Please try again.');
    }
  };

  if (selectedPatient) {
    return (
      <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>
        <NewPrescription
          patient={selectedPatient}
          doctorName={user?.name}
          onSubmit={handlePrescriptionSubmit}
          onCancel={() => setSelectedPatient(null)}
        />
      </PageWrapper>
    );
  }

  const grouped      = groupPrescriptions(prescriptions);
  const pendingCount = grouped.filter(g => g.status === 'pending').length;
  const activeCount  = grouped.filter(g => g.status === 'active').length;
  const todayCount   = grouped.filter(g => {
    return new Date(g.createdAt).toDateString() === new Date().toDateString();
  }).length;

  return (
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>

      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          Welcome, {user?.name} 👨‍⚕️
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{today}</p>
      </div>

      {/* Missed Dose Alerts — now compact & collapsible */}
      <MissedDoseAlert />

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Prescriptions Today', value: todayCount,       color: '#198754' },
          { label: 'Total Prescriptions', value: grouped.length,   color: '#C9A84C' },
          { label: 'Pending Pharmacy',    value: pendingCount,     color: '#6f42c1' },
          { label: 'Active',              value: activeCount,      color: '#fd7e14' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Search */}
      <div className="card-custom mb-4">
        <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔍 Search Patient</h5>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text" className="form-control form-control-sm"
              placeholder="Enter Matric Number or Staff ID"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); setSearchResult(null); }}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button type="submit" disabled={searching} style={{
              backgroundColor: '#198754', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '0.35rem 1.2rem',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            }}>
              {searching ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="alert alert-danger py-2 mt-3 mb-0" style={{ fontSize: '0.82rem' }}>{searchError}</div>
        )}

        {searchResult && (
          <div style={{
            marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fff4',
            borderRadius: '8px', border: '1px solid #b7ebc8',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{searchResult.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                ID: {searchResult.identifier || searchResult.id} · {searchResult.gender}
                · <span style={{ textTransform: 'capitalize' }}>{searchResult.patientType}</span>
                {searchResult.department && ` · ${searchResult.department}`}
              </div>
              {searchResult.phone && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>📞 {searchResult.phone}</div>
              )}
            </div>
            <button onClick={() => setSelectedPatient(searchResult)} style={{
              backgroundColor: '#198754', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '0.4rem 1rem',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            }}>✏️ Write Prescription</button>
          </div>
        )}
      </div>

      {/* Grouped Prescriptions */}
      <div className="card-custom">
        <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📋 My Prescriptions</h5>
        {loadingPrescriptions ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary)' }} />
          </div>
        ) : grouped.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            No prescriptions yet. Search for a patient to write one.
          </p>
        ) : (
          grouped.map(group => (
            <div key={group.key} style={{
              padding: '0.85rem 1rem', marginBottom: '0.6rem', borderRadius: '8px',
              border: `1px solid ${group.status === 'pending' ? '#ffc107' : group.status === 'active' ? '#b7ebc8' : '#e9ecef'}`,
              backgroundColor: group.status === 'pending' ? '#fffdf0' : group.status === 'active' ? '#f0fff4' : '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{group.patientName}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      backgroundColor: group.status === 'pending' ? '#fff3cd' : group.status === 'active' ? '#d1e7dd' : '#e2e3e5',
                      color: group.status === 'pending' ? '#856404' : group.status === 'active' ? '#0f5132' : '#41464b',
                      textTransform: 'capitalize',
                    }}>{group.status}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                    📅 {group.date} &nbsp;·&nbsp; 🩺 {group.diagnosis}
                  </div>
                  {/* All drugs listed */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.4rem' }}>
                    {group.drugs.map((drug, i) => (
                      <div key={drug.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                        <span style={{
                          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                          backgroundColor: drug.status === 'pending' ? '#fff3cd' : '#d1e7dd',
                          color: drug.status === 'pending' ? '#856404' : '#0f5132',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700,
                        }}>{i + 1}</span>
                        <span>💊 {drug.medicationName}</span>
                        {drug.status === 'active' && <span style={{ fontSize: '0.72rem', color: '#198754', fontWeight: 600 }}>✅</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </PageWrapper>
  );
};

export default DoctorDashboard;