import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import useAuth from '../../hooks/useAuth';
import NewPrescription from './NewPrescription';

const patientTypeColors = {
  student:  { bg: '#cfe2ff', color: '#084298' },
  staff:    { bg: '#d1e7dd', color: '#0f5132' },
  external: { bg: '#e2d9f3', color: '#432874' },
};

const SearchPatient = () => {
  const { user }                          = useAuth();
  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResult, setSearchResult]   = useState(null);
  const [searched, setSearched]           = useState(false);
  const [searching, setSearching]         = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError]                 = useState('');

  const token = localStorage.getItem('token');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSearchResult(null);
    const query = searchQuery.trim();

    if (!query) {
      setError('Please enter a patient ID to search.');
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`http://127.0.0.1:8000/patients/search?identifier=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      const data = await res.json();
      setSearched(true);

      if (res.ok) {
        setSearchResult(data);
      } else {
        setError(data.message || 'No patient found with that ID.');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setSearching(false);
    }
  };

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
        setSearched(false);
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
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          🔍 Search Patient
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          Search by matric number, staff ID or phone number
        </p>
      </div>

      {/* Search box */}
      <div className="card-custom mb-4">
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Matric Number, Staff ID or Phone Number..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setError('');
                if (!e.target.value) {
                  setSearchResult(null);
                  setSearched(false);
                }
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
                padding: '0.5rem 1.5rem',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {searching ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-danger py-2 mt-3 mb-0" style={{ fontSize: '0.82rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Search result */}
      {searched && searchResult && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
            Patient Found
          </h5>

          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            backgroundColor: '#fff',
          }}>
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
                    {searchResult.name}
                  </span>
                  {searchResult.patientType && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      backgroundColor: patientTypeColors[searchResult.patientType]?.bg || '#e2e3e5',
                      color:           patientTypeColors[searchResult.patientType]?.color || '#41464b',
                      textTransform:   'capitalize',
                    }}>
                      {searchResult.patientType}
                    </span>
                  )}
                </div>

                <div className="row g-2" style={{ fontSize: '0.82rem' }}>
                  <div className="col-12 col-md-6">
                    <span style={{ color: 'var(--muted)' }}>⚧ Gender: </span>
                    <strong>{searchResult.gender || '—'}</strong>
                  </div>
                  <div className="col-12 col-md-6">
                    <span style={{ color: 'var(--muted)' }}>📞 Phone: </span>
                    <strong>{searchResult.phone || '—'}</strong>
                  </div>
                  {searchResult.department && (
                    <div className="col-12 col-md-6">
                      <span style={{ color: 'var(--muted)' }}>🏫 Dept: </span>
                      <strong>{searchResult.department}</strong>
                    </div>
                  )}
                  <div className="col-12 col-md-6">
                    <span style={{ color: 'var(--muted)' }}>📋 Past Prescriptions: </span>
                    <strong>{searchResult.prescriptionCount ?? '—'}</strong>
                  </div>
                  {searchResult.lastVisit && (
                    <div className="col-12 col-md-6">
                      <span style={{ color: 'var(--muted)' }}>🗓 Last Visit: </span>
                      <strong>{new Date(searchResult.lastVisit).toLocaleDateString('en-GB')}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setSelectedPatient(searchResult)}
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
        </div>
      )}

      {/* Empty state */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
            Search for a Patient
          </div>
          <div style={{ fontSize: '0.82rem' }}>
            Enter a matric number, staff ID or phone number above to get started
          </div>
        </div>
      )}

    </PageWrapper>
  );
};

export default SearchPatient;