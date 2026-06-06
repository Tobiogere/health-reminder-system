import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import PageWrapper from '../../components/PageWrapper';

const PatientDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [medications, setMedications]     = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const checkMissedDoses = (meds) => {
    const now = new Date();
    return meds.map(med => {
      if (med.taken || med.missed) return med;
      const scheduledDate = new Date(med.scheduledTime);
      const diffMinutes   = (now.getTime() - scheduledDate.getTime()) / 60000;
      return { ...med, missed: diffMinutes > 90 };
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token      = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.id) return;

      // Fetch prescriptions
      const prescRes = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const prescData = await prescRes.json();
      if (prescRes.ok && Array.isArray(prescData)) {
        setPrescriptions(prescData);
      }

      // Fetch today's medications from schedule
      const scheduleRes = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/schedule`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const scheduleData = await scheduleRes.json();
      if (scheduleRes.ok && Array.isArray(scheduleData)) {
        const todayStr = new Date().toDateString();
        const meds = scheduleData.flatMap(schedule =>
          schedule.doses
            .filter(dose => new Date(dose.scheduledTime).toDateString() === todayStr)
            .map(dose => ({
              id:            dose.id,
              name:          schedule.medication,
              time:          new Date(dose.scheduledTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }),
              scheduledTime: dose.scheduledTime,
              taken:         dose.status === 'taken',
              missed:        dose.status === 'missed',
              status:        dose.status,
            }))
        );
        setMedications(meds);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMedications(prev => checkMissedDoses(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsTaken = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/medications/${id}/taken`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setMedications(prev =>
          prev.map(med => med.id === id ? { ...med, taken: true, missed: false, status: 'taken' } : med)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const takenCount         = medications.filter(m => m.taken).length;
  const totalCount         = medications.length;
  const missedMeds         = medications.filter(m => m.missed && !m.taken);
  const remainingCount     = medications.filter(m => !m.taken && !m.missed).length;
  const activePrescriptions = prescriptions.filter(p => p.status === 'active' || p.status === 'pending');
  const pastPrescriptionCount = prescriptions.filter(p => p.status !== 'active' && p.status !== 'pending').length;

  return (
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>

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
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            {[
              { label: "Today's Meds",      value: totalCount,            color: '#C9A84C' },
              { label: 'Taken Today',        value: takenCount,            color: '#198754' },
              { label: 'Remaining',          value: remainingCount,        color: '#fd7e14' },
              { label: 'Missed Today',       value: missedMeds.length,     color: '#dc3545' },
              { label: 'Past Prescriptions', value: pastPrescriptionCount, color: '#6f42c1' },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="card-custom text-center" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Missed Doses Alert */}
          {missedMeds.length > 0 && (
            <div className="mb-4" style={{ backgroundColor: '#fff5f5', border: '1px solid #f5c2c7', borderRadius: '10px', padding: '1rem 1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <h6 style={{ fontWeight: 700, color: '#842029', margin: 0, fontSize: '0.95rem' }}>
                  Missed Dose{missedMeds.length > 1 ? 's' : ''} Today
                </h6>
              </div>
              {missedMeds.map(med => (
                <div key={med.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.75rem', marginBottom: '0.4rem',
                  backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #f5c2c7', fontSize: '0.82rem',
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#842029' }}>{med.name}</span>
                    <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>was due at {med.time}</span>
                  </div>
                  <span style={{ backgroundColor: '#f8d7da', color: '#842029', borderRadius: '999px', padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>Missed</span>
                </div>
              ))}
              <p style={{ fontSize: '0.78rem', color: '#842029', margin: '0.5rem 0 0 0' }}>
                Please inform your doctor or pharmacist if you continue to miss doses.
              </p>
            </div>
          )}

          {/* Main Grid */}
          <div className="row g-3">

            {/* Today's Medications */}
            <div className="col-12 col-lg-6">
              <div className="card-custom" style={{ height: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>💊 Today's Medications</h5>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{takenCount}/{totalCount} taken</span>
                </div>

                <div style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '999px', marginBottom: '1rem' }}>
                  <div style={{
                    height: '100%',
                    width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%`,
                    backgroundColor: '#198754', borderRadius: '999px', transition: 'width 0.4s ease',
                  }} />
                </div>

                {medications.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                    No medications scheduled for today.
                  </p>
                ) : (
                  medications.map(med => (
                    <div key={med.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '8px',
                      backgroundColor: med.taken ? '#f0fff4' : med.missed ? '#fff5f5' : '#f8f9fa',
                      border: `1px solid ${med.taken ? '#b7ebc8' : med.missed ? '#f5c2c7' : '#e9ecef'}`,
                      opacity: med.taken ? 0.75 : 1,
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.88rem', fontWeight: 600,
                          textDecoration: med.taken ? 'line-through' : 'none',
                          color: med.taken ? 'var(--muted)' : med.missed ? '#842029' : 'var(--text)',
                        }}>{med.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          🕐 {med.time}
                          {med.missed && !med.taken && <span style={{ color: '#dc3545', fontWeight: 600, marginLeft: '0.4rem' }}>· Missed</span>}
                        </div>
                      </div>
                      {med.taken ? (
                        <span style={{ fontSize: '0.78rem', color: '#198754', fontWeight: 600 }}>✅ Taken</span>
                      ) : med.missed ? (
                        <span style={{ fontSize: '0.78rem', color: '#dc3545', fontWeight: 600 }}>❌ Missed</span>
                      ) : (
                        <button onClick={() => markAsTaken(med.id)} style={{
                          backgroundColor: '#C9A84C', color: '#fff', border: 'none',
                          borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        }}>Mark Taken</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="col-12 col-lg-6">

              {/* Active Prescriptions — show ALL active ones */}
              <div className="card-custom mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>📄 Active Prescription{activePrescriptions.length > 1 ? 's' : ''}</h5>
                  <button
                    onClick={() => navigate('/patient/renewal')}
                    style={{
                      backgroundColor: '#fff3cd', color: '#856404',
                      border: '1px solid #ffc107', borderRadius: '6px',
                      padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    🔄 Request Renewal
                  </button>
                </div>

                {activePrescriptions.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No active prescription found.</p>
                ) : (
                  activePrescriptions.map(rx => (
                    <div key={rx.id} style={{
                      padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '8px',
                      backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', fontSize: '0.85rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 700 }}>💊 {rx.medicationName}</span>
                        <span style={{
                          backgroundColor: rx.status === 'active' ? '#d1e7dd' : '#fff3cd',
                          color: rx.status === 'active' ? '#0f5132' : '#856404',
                          borderRadius: '999px', padding: '0.15rem 0.5rem',
                          fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
                        }}>{rx.status}</span>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>🩺 {rx.diagnosis}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>📦 {rx.dosage || 'Pending pharmacist'}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>👨‍⚕️ {rx.doctorName || 'Health Centre'} · 📅 {new Date(rx.createdAt).toLocaleDateString('en-GB')}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Prescription History */}
              <div className="card-custom">
                <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>📋 Prescription History</h5>
                {prescriptions.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No prescriptions found.</p>
                ) : (
                  prescriptions.map(rx => (
                    <div key={rx.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 0', borderBottom: '1px solid #e9ecef', fontSize: '0.82rem',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{rx.diagnosis}</div>
                        <div style={{ color: 'var(--muted)' }}>
                          {rx.doctorName || 'Health Centre'} · {new Date(rx.createdAt).toLocaleDateString('en-GB')}
                        </div>
                        <div style={{ color: 'var(--muted)' }}>💊 {rx.medicationName}</div>
                      </div>
                      <span style={{
                        backgroundColor: rx.status === 'active' ? '#d1e7dd' : rx.status === 'pending' ? '#fff3cd' : '#e2e3e5',
                        color: rx.status === 'active' ? '#0f5132' : rx.status === 'pending' ? '#856404' : '#41464b',
                        borderRadius: '999px', padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap',
                      }}>{rx.status}</span>
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