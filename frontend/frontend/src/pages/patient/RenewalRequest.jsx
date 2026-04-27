import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';

// ── Dummy Data (replace with API later) ──────────────────────
const activeDrugs = [
  { id: 1, name: 'Paracetamol 500mg', frequency: 'Twice daily',       duration: '7 days', endDate: '25 Apr 2026' },
  { id: 2, name: 'Amoxicillin 250mg', frequency: 'Three times daily', duration: '7 days', endDate: '25 Apr 2026' },
  { id: 3, name: 'Vitamin C 1000mg',  frequency: 'Once daily',        duration: '7 days', endDate: '25 Apr 2026' },
];

const pastRenewals = [
  { id: 1, drug: 'Paracetamol 500mg', requestDate: '10 Mar 2026', status: 'Approved' },
  { id: 2, drug: 'Vitamin C 1000mg',  requestDate: '01 Feb 2026', status: 'Approved' },
];
// ─────────────────────────────────────────────────────────────

const RenewalRequest = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(window.innerWidth > 768);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [note, setNote]                 = useState('');
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState('');
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const toggleDrug = (id) => {
    setSelectedDrugs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDrugs.length === 0) {
      setError('Please select at least one medication to renew.');
      return;
    }
    // TODO: Replace with API call — POST /patients/:id/renewals
    console.log('Renewal request:', {
      drugs: selectedDrugs.map(id => activeDrugs.find(d => d.id === id)?.name),
      note,
    });
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedDrugs([]);
    setNote('');
    setSubmitted(false);
    setError('');
  };

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
            🔄 Request Renewal
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Select the medications you need to renew — no doctor visit required
          </p>
        </div>

        <div className="row g-3">

          {/* Left — Renewal form */}
          <div className="col-12 col-lg-7">
            {submitted ? (
              <div className="card-custom text-center" style={{ padding: '2.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                  Renewal Request Sent!
                </h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  Your request has been sent to the pharmacist. You will be notified once it is approved.
                </p>
                <div style={{
                  backgroundColor: '#f0fff4',
                  border: '1px solid #b7ebc8',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Requested drugs:</div>
                  {selectedDrugs.map(id => (
                    <div key={id} style={{ color: 'var(--muted)' }}>
                      💊 {activeDrugs.find(d => d.id === id)?.name}
                    </div>
                  ))}
                  {note && (
                    <div style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
                      📝 Note: {note}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: '#0d6efd',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <div className="card-custom">
                <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
                  Select Medications to Renew
                </h5>

                <form onSubmit={handleSubmit} noValidate>
                  {activeDrugs.map(drug => (
                    <div
                      key={drug.id}
                      onClick={() => toggleDrug(drug.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem',
                        marginBottom: '0.6rem',
                        borderRadius: '8px',
                        border: `2px solid ${selectedDrugs.includes(drug.id) ? '#0d6efd' : '#e9ecef'}`,
                        backgroundColor: selectedDrugs.includes(drug.id) ? '#f0f5ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${selectedDrugs.includes(drug.id) ? '#0d6efd' : '#dee2e6'}`,
                        backgroundColor: selectedDrugs.includes(drug.id) ? '#0d6efd' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                      }}>
                        {selectedDrugs.includes(drug.id) && (
                          <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>
                        )}
                      </div>

                      {/* Drug info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                          💊 {drug.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {drug.frequency} · {drug.duration} · Ends {drug.endDate}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Note */}
                  <div className="mb-4 mt-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      Additional Note
                      <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.3rem' }}>
                        (optional)
                      </span>
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="e.g. Running low on medication, need refill before end date..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.82rem' }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0d6efd',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.55rem 1.5rem',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    🔄 Submit Renewal Request
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right — Past renewals */}
          <div className="col-12 col-lg-5">
            <div className="card-custom">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
                📋 Past Renewal Requests
              </h5>

              {pastRenewals.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  No past renewal requests.
                </p>
              ) : (
                pastRenewals.map(r => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      backgroundColor: '#fff',
                      fontSize: '0.82rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>💊 {r.drug}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                        Requested: {r.requestDate}
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: r.status === 'Approved' ? '#d1e7dd' : '#fff3cd',
                      color: r.status === 'Approved' ? '#0f5132' : '#856404',
                      borderRadius: '999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}>
                      {r.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Info box */}
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107',
                fontSize: '0.82rem',
                color: '#856404',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>ℹ️ How it works</div>
              <div>Your renewal request goes directly to the pharmacist — no doctor visit needed. The pharmacist will review and approve within 24 hours.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RenewalRequest;