import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';

const RenewalRequest = () => {
  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [prescriptions, setPrescriptions] = useState([]);
  const [pastRenewals, setPastRenewals]   = useState([]);
  const [selectedId, setSelectedId]       = useState(null);
  const [note, setNote]                   = useState('');
  const [submitted, setSubmitted]         = useState(false);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');

  const token      = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!storedUser?.id) return;

      // Fetch active prescriptions
      const prescRes = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const prescData = await prescRes.json();
      if (prescRes.ok && Array.isArray(prescData)) {
        setPrescriptions(prescData.filter(p => p.status === 'active' || p.status === 'pending'));
      }

      // Fetch past renewals
      const renewRes = await fetch(`http://127.0.0.1:8000/renewals/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const renewData = await renewRes.json();
      if (renewRes.ok && Array.isArray(renewData)) {
        // Filter to only show this patient's renewals
        setPastRenewals(renewData.filter(r => r.patientId === storedUser.id));
      }

    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select a prescription to renew.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/renewals`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugName: selectedPrescription?.medicationName,
          note,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        fetchData();
      } else {
        setError(data.message || 'Failed to submit renewal request.');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    setNote('');
    setSubmitted(false);
    setError('');
  };

  const statusColor = (status) => {
    if (status === 'approved') return { bg: '#d1e7dd', text: '#0f5132' };
    if (status === 'pending')  return { bg: '#fff3cd', text: '#856404' };
    if (status === 'rejected') return { bg: '#f8d7da', text: '#842029' };
    return { bg: '#e2e3e5', text: '#41464b' };
  };

  const selectedPrescription = prescriptions.find(p => p.id === selectedId);

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          🔄 Request Renewal
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          Select a prescription to renew — no doctor visit required
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading...</p>
        </div>
      ) : (
        <div className="row g-3">

          {/* Left — Renewal form */}
          <div className="col-12 col-lg-7">
            {submitted ? (
              <div className="card-custom text-center" style={{ padding: '2.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Renewal Request Sent!</h4>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  Your request has been sent to the pharmacist. You will be notified once it is approved.
                </p>
                {selectedPrescription && (
                  <div style={{
                    backgroundColor: '#f0fff4', border: '1px solid #b7ebc8',
                    borderRadius: '8px', padding: '0.75rem 1rem',
                    marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left',
                  }}>
                    <div>💊 <strong>{selectedPrescription.medicationName}</strong></div>
                    <div style={{ color: 'var(--muted)' }}>🩺 {selectedPrescription.diagnosis}</div>
                    {note && <div style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>📝 {note}</div>}
                  </div>
                )}
                <button onClick={handleReset} className="btn-primary-custom" style={{ padding: '0.5rem 1.5rem', width: 'auto' }}>
                  Submit Another Request
                </button>
              </div>
            ) : (
              <div className="card-custom">
                <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
                  Select Prescription to Renew
                </h5>

                {error && (
                  <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.82rem' }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {prescriptions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      <p>No active prescriptions found to renew.</p>
                    </div>
                  ) : (
                    prescriptions.map(rx => (
                      <div
                        key={rx.id}
                        onClick={() => { setSelectedId(rx.id); setError(''); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.85rem',
                          padding: '0.85rem', marginBottom: '0.6rem', borderRadius: '8px',
                          border: `2px solid ${selectedId === rx.id ? '#C9A84C' : '#e9ecef'}`,
                          backgroundColor: selectedId === rx.id ? '#fffbf0' : '#fff',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          border: `2px solid ${selectedId === rx.id ? '#C9A84C' : '#dee2e6'}`,
                          backgroundColor: selectedId === rx.id ? '#C9A84C' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {selectedId === rx.id && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>💊 {rx.medicationName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            🩺 {rx.diagnosis} · 👨‍⚕️ {rx.doctorName || 'Health Centre'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            📅 {new Date(rx.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </div>
                        <span style={{
                          backgroundColor: rx.status === 'active' ? '#d1e7dd' : '#fff3cd',
                          color: rx.status === 'active' ? '#0f5132' : '#856404',
                          borderRadius: '999px', padding: '0.15rem 0.5rem',
                          fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize',
                        }}>{rx.status}</span>
                      </div>
                    ))
                  )}

                  <div className="mb-4 mt-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                      Additional Note
                      <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.3rem' }}>(optional)</span>
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="e.g. Running low on medication, need refill before end date..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-custom"
                    disabled={submitting}
                    style={{ padding: '0.55rem' }}
                  >
                    {submitting ? 'Submitting...' : '🔄 Submit Renewal Request'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right — Past renewals */}
          <div className="col-12 col-lg-5">
            <div className="card-custom">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📋 Past Renewal Requests</h5>
              {pastRenewals.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No past renewal requests.</p>
              ) : (
                pastRenewals.map(r => {
                  const colors = statusColor(r.status);
                  return (
                    <div key={r.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '8px',
                      border: '1px solid #e9ecef', backgroundColor: '#fff',
                      fontSize: '0.82rem', flexWrap: 'wrap', gap: '0.5rem',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>💊 {r.drug || 'Prescription'}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                          Requested: {new Date(r.requestDate).toLocaleDateString('en-GB')}
                        </div>
                        {r.note && <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>📝 {r.note}</div>}
                      </div>
                      <span style={{
                        backgroundColor: colors.bg, color: colors.text,
                        borderRadius: '999px', padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                      }}>{r.status}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{
              marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd',
              borderRadius: '8px', border: '1px solid #ffc107',
              fontSize: '0.82rem', color: '#856404',
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>ℹ️ How it works</div>
              <div>Your renewal request goes directly to the pharmacist — no doctor visit needed. The pharmacist will review and approve within 24 hours.</div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default RenewalRequest;