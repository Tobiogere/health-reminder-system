import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import NewPrescription from './NewPrescription';
import MissedDoseAlert from '../../components/MissedDoseAlert';
import PageWrapper from '../../components/PageWrapper';

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

  // ── Fetch doctor's prescriptions ──
  const fetchPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`http://127.0.0.1:8000/prescriptions/doctor/${storedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPrescriptions(data);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPrescriptions(); }, []);

  // ── Search patient by identifier ──
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Please enter a Patient ID or matric number.');
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`http://127.0.0.1:8000/patients/${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
      } else {
        setSearchError(data.message || 'No patient found with that ID.');
      }
    } catch (err) {
      setSearchError('Could not connect to server. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // ── Handle prescription submission ──
  const handlePrescriptionSubmit = async (prescriptionData) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/prescriptions/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
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

  // Show prescription form if patient selected
  if (selectedPatient) {
    return (
      <PageWrapper
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={() => setSidebarOpen(false)}
      >
        <NewPrescription
          patient={selectedPatient}
          doctorName={user?.name}
          onSubmit={handlePrescriptionSubmit}
          onCancel={() => setSelectedPatient(null)}
        />
      </PageWrapper>
    );
  }

  const pendingCount    = prescriptions.filter(p => p.status === 'pending').length;
  const todayCount      = prescriptions.filter(p => {
    const today = new Date().toDateString();
    return new Date(p.created_at).toDateString() === today;
  }).length;

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* ── Welcome Header ── */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          Welcome, {user?.name} 👨‍⚕️
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{today}</p>
      </div>

      {/* ── Missed Dose Alerts ── */}
      <MissedDoseAlert />

      {/* ── Summary Cards ── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
              {todayCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Prescriptions Today</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
              {prescriptions.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Prescriptions</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pending Pharmacy</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
              {prescriptions.filter(p => p.status === 'active').length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Active</div>
          </div>
        </div>
      </div>

      {/* ── Patient Search ── */}
      <div className="card-custom mb-4">
        <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
          🔍 Search Patient
        </h5>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Enter Matric Number or Staff ID"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchError('');
                setSearchResult(null);
              }}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                backgroundColor: '#198754',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 1.2rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="alert alert-danger py-2 mt-3 mb-0" style={{ fontSize: '0.82rem' }}>
            {searchError}
          </div>
        )}

        {searchResult && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f0fff4',
            borderRadius: '8px',
            border: '1px solid #b7ebc8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{searchResult.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                ID: {searchResult.identifier || searchResult.id} &nbsp;·&nbsp;
                {searchResult.gender} &nbsp;·&nbsp;
                <span style={{ textTransform: 'capitalize' }}>{searchResult.patientType}</span>
                {searchResult.department && ` · ${searchResult.department}`}
              </div>
              {searchResult.prescriptionCount !== undefined && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                  📋 {searchResult.prescriptionCount} past prescription(s)
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedPatient(searchResult)}
              style={{
                backgroundColor: '#198754',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 1rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              ✏️ Write Prescription
            </button>
          </div>
        )}
      </div>

      {/* ── Recent Prescriptions ── */}
      <div className="card-custom">
        <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
          📋 My Prescriptions
        </h5>
        {loadingPrescriptions ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary)' }} />
          </div>
        ) : prescriptions.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            No prescriptions yet. Search for a patient to write one.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                  {['Patient', 'Diagnosis', 'Drug', 'Date', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '0.6rem 0.8rem',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      borderBottom: '1px solid #e9ecef',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(rx => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600 }}>
                      {rx.patient_fullname || rx.patient_username}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>{rx.diagnosis}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: 'var(--muted)' }}>
                      {rx.medication_name}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(rx.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '0.65rem 0.8rem' }}>
                      <span style={{
                        backgroundColor: rx.status === 'active'  ? '#d1e7dd' :
                                         rx.status === 'pending' ? '#fff3cd' : '#e2e3e5',
                        color:           rx.status === 'active'  ? '#0f5132' :
                                         rx.status === 'pending' ? '#856404' : '#41464b',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                      }}>
                        {rx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </PageWrapper>
  );
};

export default DoctorDashboard;