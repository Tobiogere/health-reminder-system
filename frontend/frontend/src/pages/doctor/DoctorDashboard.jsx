import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import NewPrescription from './NewPrescription';
import MissedDoseAlert from '../../components/MissedDoseAlert';
import PageWrapper from '../../components/PageWrapper';

// ── Dummy patient database (replace with API later) ──────────
const patientDatabase = [
  { id: 'STU/2024/001', name: 'Chukwuemeka Obi',  gender: 'Male',   patientType: 'student',  department: 'Computer Science' },
  { id: 'STU/2024/042', name: 'Amina Bello',       gender: 'Female', patientType: 'student',  department: 'Medicine' },
  { id: 'STF/2024/010', name: 'Mr. Tunde Adeyemi', gender: 'Male',   patientType: 'staff',    department: null },
  { id: '08031234567',  name: 'Grace Eze',          gender: 'Female', patientType: 'external', department: null },
];

const recentPrescriptions = [
  { id: 1, patientName: 'Chukwuemeka Obi', diagnosis: 'Malaria',   drugs: 'Paracetamol, Coartem',   date: '18 Apr 2026', status: 'Sent to Pharmacy' },
  { id: 2, patientName: 'Amina Bello',     diagnosis: 'Typhoid',   drugs: 'Ciprofloxacin, ORS',     date: '17 Apr 2026', status: 'Sent to Pharmacy' },
  { id: 3, patientName: 'Grace Eze',       diagnosis: 'Upper RTI', drugs: 'Amoxicillin, Vitamin C', date: '16 Apr 2026', status: 'Sent to Pharmacy' },
];
// ─────────────────────────────────────────────────────────────

const DoctorDashboard = () => {
  const { user }                              = useAuth();
  const [sidebarOpen, setSidebarOpen]         = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResult, setSearchResult]       = useState(null);
  const [searchError, setSearchError]         = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchError('Please enter a Patient ID or name.');
      return;
    }
    const found = patientDatabase.find(p =>
      p.id.toLowerCase() === query ||
      p.name.toLowerCase().includes(query)
    );
    if (found) {
      setSearchResult(found);
    } else {
      setSearchError('No patient found with that ID or name.');
    }
  };

  const handlePrescriptionSubmit = (prescriptionData) => {
    // TODO: Replace with API call — POST /prescriptions
    console.log('Prescription submitted:', prescriptionData);
    setSelectedPatient(null);
    setSearchResult(null);
    setSearchQuery('');
    alert(`Prescription for ${prescriptionData.patientName} sent to pharmacy.`);
  };

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

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
              {recentPrescriptions.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Prescriptions Today</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
              {patientDatabase.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Patients in System</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>2</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pending Pharmacy</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>1</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Renewal Requests</div>
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
              placeholder="Enter Patient ID or Full Name"
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
              Search
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
                ID: {searchResult.id} &nbsp;·&nbsp;
                {searchResult.gender} &nbsp;·&nbsp;
                <span style={{ textTransform: 'capitalize' }}>{searchResult.patientType}</span>
                {searchResult.department && ` · ${searchResult.department}`}
              </div>
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
          📋 Recent Prescriptions
        </h5>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                {['Patient', 'Diagnosis', 'Drugs', 'Date', 'Status'].map(h => (
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
              {recentPrescriptions.map(rx => (
                <tr key={rx.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600 }}>{rx.patientName}</td>
                  <td style={{ padding: '0.65rem 0.8rem' }}>{rx.diagnosis}</td>
                  <td style={{ padding: '0.65rem 0.8rem', color: 'var(--muted)' }}>{rx.drugs}</td>
                  <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'nowrap' }}>{rx.date}</td>
                  <td style={{ padding: '0.65rem 0.8rem' }}>
                    <span style={{
                      backgroundColor: '#d1e7dd',
                      color: '#0f5132',
                      borderRadius: '999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
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
      </div>

    </PageWrapper>
  );
};

export default DoctorDashboard;