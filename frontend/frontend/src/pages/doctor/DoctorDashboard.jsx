import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import NewPrescription from './NewPrescription';
import MissedDoseAlert from '../../components/MissedDoseAlert';
import PageWrapper from '../../components/PageWrapper';

const groupPrescriptions = (prescriptions) => {
  const groups = {};
  prescriptions.forEach(rx => {
    const date = new Date(rx.createdAt).toLocaleDateString('en-GB');
    const key  = `${rx.patientId}-${rx.diagnosis}-${date}`;
    if (!groups[key]) {
      groups[key] = {
        key, patientName: rx.patientName, patientId: rx.patientId,
        diagnosis: rx.diagnosis, date, status: rx.status, createdAt: rx.createdAt, drugs: [],
      };
    }
    groups[key].drugs.push({ id: rx.id, medicationName: rx.medicationName, status: rx.status });
    if (rx.status === 'pending') groups[key].status = 'pending';
    if (rx.status === 'active' && groups[key].status !== 'pending') groups[key].status = 'active';
  });
  return Object.values(groups);
};

// ── Collapsible missed patient card ──
const MissedPatientCard = ({ patient }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      marginBottom: '0.6rem', borderRadius: '8px',
      border: '1px solid #f5c2c7', overflow: 'hidden',
    }}>
      {/* Header — always visible */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1rem', backgroundColor: '#fff5f5', cursor: 'pointer',
          gap: '0.5rem', flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{patient.patientName}</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>· {patient.patientId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            backgroundColor: '#f8d7da', color: '#842029',
            borderRadius: '999px', padding: '0.15rem 0.6rem',
            fontSize: '0.72rem', fontWeight: 700,
          }}>{patient.doses.length} missed</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Dropdown — only when open */}
      {open && (
        <div style={{ backgroundColor: '#fff', padding: '0.5rem 1rem 0.75rem 1rem' }}>
          {patient.doses.map((dose, i) => (
            <div key={dose.doseId} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              fontSize: '0.82rem', padding: '0.4rem 0',
              borderTop: i === 0 ? 'none' : '1px solid #f5c2c7',
            }}>
              <span>💊 <strong>{dose.drug}</strong></span>
              <span style={{ color: 'var(--muted)' }}>·</span>
              <span style={{ color: '#dc3545' }}>
                {new Date(dose.scheduledTime).toLocaleDateString('en-GB')} at {dose.missedAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DoctorDashboard = () => {
  const { user }                              = useAuth();
  const [sidebarOpen, setSidebarOpen]         = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab]             = useState('overview');
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResult, setSearchResult]       = useState(null);
  const [searchError, setSearchError]         = useState('');
  const [searching, setSearching]             = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions]     = useState([]);
  const [missedDoses, setMissedDoses]         = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [loadingMissed, setLoadingMissed]     = useState(true);

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

  const fetchMissedDoses = async () => {
    try {
      setLoadingMissed(true);
      const res = await fetch('http://127.0.0.1:8000/schedules/missed-doses/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setMissedDoses(data);
    } catch (err) {
      console.error('Error fetching missed doses:', err);
    } finally {
      setLoadingMissed(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPrescriptions(); fetchMissedDoses(); }, []);

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
    const savedToken = localStorage.getItem('token');
    const savedSearchResult = searchResult;
    try {
      const prescRes = await fetch('http://127.0.0.1:8000/prescriptions/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${savedToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId:  savedSearchResult.id,
          diagnosis:  prescriptionData.diagnosis,
          drugs:      prescriptionData.drugs,
          notes:      prescriptionData.notes,
          doctorName: user?.name,
        }),
      });
      if (!prescRes.ok) {
        const errData = await prescRes.json();
        alert(errData.message || 'Failed to submit prescription.');
        return;
      }
      const customDrugs = prescriptionData.customDrugs || [];
      for (let i = 0; i < customDrugs.length; i++) {
        await fetch('http://127.0.0.1:8000/drugs/suggest', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${savedToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ drugName: customDrugs[i] }),
        });
      }
      setSelectedPatient(null);
      setSearchResult(null);
      setSearchQuery('');
      fetchPrescriptions();
      alert(`Prescription for ${prescriptionData.patientName} sent to pharmacy successfully.`);
    } catch (err) {
      alert(`Error: ${err.message}`);
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
  const todayCount   = grouped.filter(g => new Date(g.createdAt).toDateString() === new Date().toDateString()).length;

  const missedByPatient = missedDoses.reduce((acc, dose) => {
    const key = dose.patientId;
    if (!acc[key]) acc[key] = { patientName: dose.patientName, patientId: dose.patientId, doses: [] };
    acc[key].doses.push(dose);
    return acc;
  }, {});

  return (
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>

      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>Welcome, {user?.name} 👨‍⚕️</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{today}</p>
      </div>

      <MissedDoseAlert />

      <div className="row g-3 mb-4">
        {[
          { label: 'Prescriptions Today', value: todayCount,        color: '#198754' },
          { label: 'Total Prescriptions', value: grouped.length,    color: '#C9A84C' },
          { label: 'Pending Pharmacy',    value: pendingCount,      color: '#6f42c1' },
          { label: 'Missed Doses',        value: missedDoses.length, color: '#dc3545' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '2px solid #e9ecef', flexWrap: 'wrap' }}>
        {[
          { key: 'overview', label: '📋 My Prescriptions' },
          { key: 'search',   label: '🔍 Write Prescription' },
          { key: 'missed',   label: `⚠️ Missed Doses${missedDoses.length > 0 ? ` (${missedDoses.length})` : ''}` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === tab.key ? '2px solid #198754' : '2px solid transparent',
            marginBottom: '-2px', padding: '0.5rem 1rem',
            fontWeight: activeTab === tab.key ? 700 : 500,
            color: activeTab === tab.key ? '#198754' : 'var(--muted)',
            cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* MY PRESCRIPTIONS TAB */}
      {activeTab === 'overview' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📋 My Prescriptions</h5>
          {loadingPrescriptions ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary)' }} /></div>
          ) : grouped.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No prescriptions yet.</p>
          ) : (
            grouped.map(group => (
              <div key={group.key} style={{
                padding: '0.85rem 1rem', marginBottom: '0.6rem', borderRadius: '8px',
                border: `1px solid ${group.status === 'pending' ? '#ffc107' : group.status === 'active' ? '#b7ebc8' : '#e9ecef'}`,
                backgroundColor: group.status === 'pending' ? '#fffdf0' : group.status === 'active' ? '#f0fff4' : '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{group.patientName}</span>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px',
                    backgroundColor: group.status === 'pending' ? '#fff3cd' : group.status === 'active' ? '#d1e7dd' : '#e2e3e5',
                    color: group.status === 'pending' ? '#856404' : group.status === 'active' ? '#0f5132' : '#41464b',
                    textTransform: 'capitalize',
                  }}>{group.status}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                  📅 {group.date} &nbsp;·&nbsp; 🩺 {group.diagnosis}
                </div>
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
            ))
          )}
        </div>
      )}

      {/* WRITE PRESCRIPTION TAB */}
      {activeTab === 'search' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔍 Search Patient</h5>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input type="text" className="form-control form-control-sm"
                placeholder="Enter Matric Number or Staff ID"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchError(''); setSearchResult(null); }}
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
          {searchError && <div className="alert alert-danger py-2 mt-3 mb-0" style={{ fontSize: '0.82rem' }}>{searchError}</div>}
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
              </div>
              <button onClick={() => setSelectedPatient(searchResult)} style={{
                backgroundColor: '#198754', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '0.4rem 1rem',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
              }}>✏️ Write Prescription</button>
            </div>
          )}
        </div>
      )}

      {/* MISSED DOSES TAB */}
      {activeTab === 'missed' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>⚠️ Patients with Missed Doses</h5>
          <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: '1rem' }}>
            Click on a patient to see their missed doses
          </p>
          {loadingMissed ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: '#dc3545' }} /></div>
          ) : Object.keys(missedByPatient).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <p style={{ fontSize: '0.88rem' }}>No missed doses — all patients are on track!</p>
            </div>
          ) : (
            Object.values(missedByPatient).map(patient => (
              <MissedPatientCard key={patient.patientId} patient={patient} />
            ))
          )}
        </div>
      )}

    </PageWrapper>
  );
};

export default DoctorDashboard;