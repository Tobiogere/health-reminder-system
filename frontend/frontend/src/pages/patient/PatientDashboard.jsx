import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import PageWrapper from '../../components/PageWrapper';

// ── Dummy data (replace with API later) ──────────────────────
const todayMeds = [
  { id: 1, name: 'Paracetamol 500mg', time: '08:00 AM', scheduledTime: '08:00', taken: false, missed: false },
  { id: 2, name: 'Amoxicillin 250mg', time: '12:00 PM', scheduledTime: '12:00', taken: false, missed: false },
  { id: 3, name: 'Vitamin C 1000mg',  time: '06:00 PM', scheduledTime: '18:00', taken: false, missed: false },
];

const upcomingSchedule = [
  { day: 'Tomorrow',  meds: ['Paracetamol 500mg', 'Amoxicillin 250mg'] },
  { day: 'Wednesday', meds: ['Paracetamol 500mg', 'Vitamin C 1000mg']  },
  { day: 'Thursday',  meds: ['Amoxicillin 250mg']                       },
];

const prescriptionHistory = [
  { id: 1, date: '2026-04-10', doctor: 'Dr. Adebayo', diagnosis: 'Malaria',   status: 'Completed' },
  { id: 2, date: '2026-03-22', doctor: 'Dr. Okafor',  diagnosis: 'Typhoid',   status: 'Completed' },
  { id: 3, date: '2026-02-14', doctor: 'Dr. Adebayo', diagnosis: 'Upper RTI', status: 'Completed' },
];
// ─────────────────────────────────────────────────────────────

const PatientDashboard = () => {
  const { user } = useAuth();

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

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [medications, setMedications] = useState(() => checkMissedDoses(todayMeds));
  const [renewalSent, setRenewalSent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMedications(prev => checkMissedDoses(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const takenCount = medications.filter(m => m.taken).length;
  const totalCount = medications.length;
  const missedMeds = medications.filter(m => m.missed && !m.taken);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const markAsTaken = (id) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: true } : med
    ));
  };

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

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
              {prescriptionHistory.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Past Prescriptions</div>
          </div>
        </div>
      </div>

      {/* ── Missed Doses Alert Section ── */}
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
                width: `${(takenCount / totalCount) * 100}%`,
                backgroundColor: '#198754',
                borderRadius: '999px',
                transition: 'width 0.4s ease',
              }} />
            </div>

            {medications.map((med) => (
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
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="col-12 col-lg-6">

          {/* Active Prescriptions + Renewal */}
          <div className="card-custom mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                📄 Active Prescription
              </h5>
              {!renewalSent ? (
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
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              <div>📅 Issued: <strong>10 April 2026</strong></div>
              <div>👨‍⚕️ Doctor: <strong>Dr. Adebayo</strong></div>
              <div>🩺 Diagnosis: <strong>Malaria</strong></div>
              <div>💊 Drugs: <strong>Paracetamol, Amoxicillin, Vitamin C</strong></div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="card-custom mb-3">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
              📅 Upcoming Schedule
            </h5>
            {upcomingSchedule.map((day, i) => (
              <div
                key={i}
                style={{
                  padding: '0.6rem 0',
                  borderBottom: i < upcomingSchedule.length - 1 ? '1px solid #e9ecef' : 'none',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                  {day.day}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  {day.meds.join(' · ')}
                </div>
              </div>
            ))}
          </div>

          {/* Prescription History */}
          <div className="card-custom">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
              📋 Prescription History
            </h5>
            {prescriptionHistory.map((rx) => (
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
                  <div style={{ color: 'var(--muted)' }}>{rx.doctor} · {rx.date}</div>
                </div>
                <span style={{
                  backgroundColor: '#d1e7dd',
                  color: '#0f5132',
                  borderRadius: '999px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}>
                  {rx.status}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default PatientDashboard;