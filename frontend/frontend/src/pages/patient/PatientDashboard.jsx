import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import PageWrapper from '../../components/PageWrapper';

const PatientDashboard = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen]       = useState(window.innerWidth > 768);
  const [medications, setMedications]       = useState([]);
  const [prescriptions, setPrescriptions]   = useState([]);
  const [activePrescription, setActive]     = useState(null);
  const [renewalSent, setRenewalSent]       = useState(false);
  const [loading, setLoading]               = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Check missed doses ──
  const checkMissedDoses = (meds) => {
    const now = new Date();
    return meds.map((med) => {
      if (med.taken || med.missed) return med;
      const [hours, minutes] = med.scheduledTime.split(':').map(Number);
      const scheduledDate = new Date();
      scheduledDate.setHours(hours, minutes, 0, 0);
      const diffMinutes = (now - scheduledDate) / 60000;
      return { ...med, missed: diffMinutes > 90 };
    });
  };

  // ── Fetch prescriptions from backend ──
  const fetchData = async () => {
    try {
      setLoading(true);
      const token     = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!storedUser?.id) return;

      const prescRes = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      const prescData = await prescRes.json();

      if (prescRes.ok && Array.isArray(prescData)) {
        setPrescriptions(prescData);

        // Set active prescription (latest one with status active or pending)
        const active = prescData.find(p => p.status === 'active' || p.status === 'pending');
        if (active) setActive(active);

        // Build today's medications from active prescription
        if (active) {
          const meds = [
            {
              id: 1,
              name: active.medication_name,
              time: '08:00 AM',
              scheduledTime: '08:00',
              taken: false,
              missed: false,
            },
          ];
          setMedications(checkMissedDoses(meds));
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
  
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchData(); }, []);

// ── Auto check missed doses every minute ──
  useEffect(() => {
    const interval = setInterval(() => {
      setMedications(prev => checkMissedDoses(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const takenCount  = medications.filter(m => m.taken).length;
  const totalCount  = medications.length;
  const missedMeds  = medications.filter(m => m.missed && !m.taken);

  const markAsTaken = (id) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: true } : med
    ));
  };

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* ── Welcome Header ── */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          Welcome back, {user?.name} 👋
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{today}</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading your data...</p>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
                  {totalCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Today's Meds</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
                  {takenCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Taken Today</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
                  {totalCount - takenCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Remaining</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#dc3545' }}>
                  {missedMeds.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Missed Today</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
                  {prescriptions.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Past Prescriptions</div>
              </div>
            </div>
          </div>

          {/* ── Missed Doses Alert ── */}
          {missedMeds.length > 0 && (
            <div
              className="mb-4"
              style={{
                backgroundColor: '#fff5f5',
                border: '1px solid #f5c2c7',
                borderRadius: '10px',
                padding: '1rem 1.2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <h6 style={{ fontWeight: 700, color: '#842029', margin: 0, fontSize: '0.95rem' }}>
                  Missed Dose{missedMeds.length > 1 ? 's' : ''} Today
                </h6>
              </div>
              {missedMeds.map(med => (
                <div
                  key={med.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.4rem',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #f5c2c7',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: '#842029' }}>{med.name}</span>
                    <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>
                      was due at {med.time}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: '#f8d7da',
                    color: '#842029',
                    borderRadius: '999px',
                    padding: '0.15rem 0.6rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}>
                    Missed
                  </span>
                </div>
              ))}
              <p style={{ fontSize: '0.78rem', color: '#842029', margin: '0.5rem 0 0 0' }}>
                Please inform your doctor or pharmacist if you continue to miss doses.
              </p>
            </div>
          )}

          {/* ── Main Grid ── */}
          <div className="row g-3">

            {/* Today's Medications */}
            <div className="col-12 col-lg-6">
              <div className="card-custom" style={{ height: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                    💊 Today's Medications
                  </h5>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {takenCount}/{totalCount} taken
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '999px', marginBottom: '1rem' }}>
                  <div style={{
                    height: '100%',
                    width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%`,
                    backgroundColor: '#198754',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>

                {medications.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                    No medications scheduled for today.
                  </p>
                ) : (
                  medications.map((med) => (
                    <div
                      key={med.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        borderRadius: '8px',
                        backgroundColor: med.taken ? '#f0fff4' : med.missed ? '#fff5f5' : '#f8f9fa',
                        border: `1px solid ${med.taken ? '#b7ebc8' : med.missed ? '#f5c2c7' : '#e9ecef'}`,
                        opacity: med.taken ? 0.75 : 1,
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          textDecoration: med.taken ? 'line-through' : 'none',
                          color: med.taken ? 'var(--muted)' : med.missed ? '#842029' : 'var(--text)',
                        }}>
                          {med.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          🕐 {med.time}
                          {med.missed && !med.taken && (
                            <span style={{ color: '#dc3545', fontWeight: 600, marginLeft: '0.4rem' }}>
                              · Missed
                            </span>
                          )}
                        </div>
                      </div>

                      {med.taken ? (
                        <span style={{ fontSize: '0.78rem', color: '#198754', fontWeight: 600 }}>✅ Taken</span>
                      ) : med.missed ? (
                        <span style={{ fontSize: '0.78rem', color: '#dc3545', fontWeight: 600 }}>❌ Missed</span>
                      ) : (
                        <button
                          onClick={() => markAsTaken(med.id)}
                          style={{
                            backgroundColor: '#C9A84C',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Taken
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="col-12 col-lg-6">

              {/* Active Prescription */}
              <div className="card-custom mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                    📄 Active Prescription
                  </h5>
                  {activePrescription && (
                    !renewalSent ? (
                      <button
                        onClick={() => setRenewalSent(true)}
                        style={{
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          border: '1px solid #ffc107',
                          borderRadius: '6px',
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🔄 Request Renewal
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#198754', fontWeight: 600 }}>
                        ✅ Renewal Requested
                      </span>
                    )
                  )}
                </div>
                {activePrescription ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    <div>📅 Issued: <strong>{new Date(activePrescription.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                    <div>👨‍⚕️ Doctor: <strong>{activePrescription.doctor_username}</strong></div>
                    <div>🩺 Diagnosis: <strong>{activePrescription.diagnosis}</strong></div>
                    <div>💊 Drug: <strong>{activePrescription.medication_name}</strong></div>
                    <div>📦 Dosage: <strong>{activePrescription.dosage || 'Pending pharmacist'}</strong></div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{
                        backgroundColor: activePrescription.status === 'active' ? '#d1e7dd' : '#fff3cd',
                        color: activePrescription.status === 'active' ? '#0f5132' : '#856404',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}>
                        {activePrescription.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    No active prescription found.
                  </p>
                )}
              </div>

              {/* Prescription History */}
              <div className="card-custom">
                <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
                  📋 Prescription History
                </h5>
                {prescriptions.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    No prescriptions found.
                  </p>
                ) : (
                  prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{rx.diagnosis}</div>
                        <div style={{ color: 'var(--muted)' }}>
                          {rx.doctor_username} · {new Date(rx.created_at).toLocaleDateString('en-GB')}
                        </div>
                        <div style={{ color: 'var(--muted)' }}>💊 {rx.medication_name}</div>
                      </div>
                      <span style={{
                        backgroundColor: rx.status === 'active' ? '#d1e7dd' : rx.status === 'pending' ? '#fff3cd' : '#e2e3e5',
                        color: rx.status === 'active' ? '#0f5132' : rx.status === 'pending' ? '#856404' : '#41464b',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                      }}>
                        {rx.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default PatientDashboard;