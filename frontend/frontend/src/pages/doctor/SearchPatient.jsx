import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';
import useAuth from '../../hooks/useAuth';
import NewPrescription from './NewPrescription';

// ── Dummy Data (replace with API later) ──────────────────────
const patientDatabase = [
  {
    id: 'STU/2024/001',
    name: 'Chukwuemeka Obi',
    gender: 'Male',
    patientType: 'student',
    department: 'Computer Science',
    phone: '08012345678',
    prescriptionCount: 3,
    lastVisit: '18 Apr 2026',
  },
  {
    id: 'STU/2024/042',
    name: 'Amina Bello',
    gender: 'Female',
    patientType: 'student',
    department: 'Medicine',
    phone: '08087654321',
    prescriptionCount: 1,
    lastVisit: '17 Apr 2026',
  },
  {
    id: 'STF/2024/010',
    name: 'Mr. Tunde Adeyemi',
    gender: 'Male',
    patientType: 'staff',
    department: null,
    phone: '08055556666',
    prescriptionCount: 2,
    lastVisit: '15 Apr 2026',
  },
  {
    id: '08031234567',
    name: 'Grace Eze',
    gender: 'Female',
    patientType: 'external',
    department: null,
    phone: '08031234567',
    prescriptionCount: 1,
    lastVisit: '16 Apr 2026',
  },
];
// ─────────────────────────────────────────────────────────────

const patientTypeColors = {
  student:  { bg: '#cfe2ff', color: '#084298' },
  staff:    { bg: '#d1e7dd', color: '#0f5132' },
  external: { bg: '#e2d9f3', color: '#432874' },
};

const SearchPatient = () => {
  const { user }                          = useAuth();
  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched]           = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError]                 = useState('');
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setError('Please enter a patient ID or name to search.');
      return;
    }

    // TODO: Replace with API call — GET /patients?search=query
    const results = patientDatabase.filter(p =>
      p.id.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );

    setSearchResults(results);
    setSearched(true);

    if (results.length === 0) {
      setError('No patient found with that ID, name or phone number.');
    }
  };

  const handlePrescriptionSubmit = (prescriptionData) => {
    // TODO: Replace with API call — POST /prescriptions
    console.log('Prescription submitted:', prescriptionData);
    setSelectedPatient(null);
    setSearchResults([]);
    setSearchQuery('');
    setSearched(false);
    alert(`Prescription for ${prescriptionData.patientName} sent to pharmacy.`);
  };

  // Show prescription form if patient selected
  if (selectedPatient) {
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
          <NewPrescription
            patient={selectedPatient}
            doctorName={user?.name}
            onSubmit={handlePrescriptionSubmit}
            onCancel={() => setSelectedPatient(null)}
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
        <div className="mb-4">
          <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
            🔍 Search Patient
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Search by patient ID, full name or phone number
          </p>
        </div>

        {/* Search box */}
        <div className="card-custom mb-4">
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Patient ID, Full Name or Phone Number..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setError('');
                  if (!e.target.value) {
                    setSearchResults([]);
                    setSearched(false);
                  }
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
                  padding: '0.5rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                🔍 Search
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="alert alert-danger py-2 mt-3 mb-0" style={{ fontSize: '0.82rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Search results */}
        {searched && searchResults.length > 0 && (
          <div className="card-custom">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
              {searchResults.length} Patient{searchResults.length > 1 ? 's' : ''} Found
            </h5>

            {searchResults.map(patient => (
              <div
                key={patient.id}
                style={{
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  backgroundColor: '#fff',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  {/* Patient info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.4rem',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {patient.name}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: patientTypeColors[patient.patientType].bg,
                        color:           patientTypeColors[patient.patientType].color,
                        textTransform:   'capitalize',
                      }}>
                        {patient.patientType}
                      </span>
                    </div>

                    <div className="row g-2" style={{ fontSize: '0.82rem' }}>
                      <div className="col-12 col-md-6">
                        <span style={{ color: 'var(--muted)' }}>🪪 ID: </span>
                        <strong>{patient.id}</strong>
                      </div>
                      <div className="col-12 col-md-6">
                        <span style={{ color: 'var(--muted)' }}>⚧ Gender: </span>
                        <strong>{patient.gender}</strong>
                      </div>
                      <div className="col-12 col-md-6">
                        <span style={{ color: 'var(--muted)' }}>📞 Phone: </span>
                        <strong>{patient.phone}</strong>
                      </div>
                      {patient.department && (
                        <div className="col-12 col-md-6">
                          <span style={{ color: 'var(--muted)' }}>🏫 Dept: </span>
                          <strong>{patient.department}</strong>
                        </div>
                      )}
                      <div className="col-12 col-md-6">
                        <span style={{ color: 'var(--muted)' }}>📋 Prescriptions: </span>
                        <strong>{patient.prescriptionCount}</strong>
                      </div>
                      <div className="col-12 col-md-6">
                        <span style={{ color: 'var(--muted)' }}>🗓 Last Visit: </span>
                        <strong>{patient.lastVisit}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    style={{
                      backgroundColor: '#198754',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1.2rem',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ✏️ Write Prescription
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state — before search */}
        {!searched && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              Search for a Patient
            </div>
            <div style={{ fontSize: '0.82rem' }}>
              Enter a patient ID, name or phone number above to get started
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchPatient;