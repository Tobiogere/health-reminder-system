import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';

const MedicationSchedule = () => {
  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [schedules, setSchedules]         = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedId, setSelectedId]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const token      = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!storedUser?.id) return;

      // Fetch prescriptions
      const prescRes = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });
      const prescData = await prescRes.json();
      if (prescRes.ok && Array.isArray(prescData)) {
        setPrescriptions(prescData);
        if (prescData.length > 0) setSelectedId(prescData[0].id);
      }

      // Fetch schedules
      const schedRes = selectedId
  ? await fetch(`http://127.0.0.1:8000/api/schedules/${selectedId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    })
  : null;

const schedData = schedRes ? await schedRes.json() : [];
      if (schedRes.ok && Array.isArray(schedData)) {
        setSchedules(schedData);
      }

    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchData(); }, []);

  const selectedPrescription = prescriptions.find(p => p.id === selectedId);

  // Get schedules for selected prescription
  const selectedSchedules = schedules.filter(s => s.prescription === selectedId);

  // Build reminder times from schedules
  const reminderTimes = selectedSchedules.map(s => s.reminder_time || s.time).filter(Boolean);

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          📅 My Medication Schedule
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          Track your full medication plan and daily progress
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading schedule...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : prescriptions.length === 0 ? (
        <div className="card-custom text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h5 style={{ fontWeight: 700 }}>No Schedule Yet</h5>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            Your medication schedule will appear here once a pharmacist processes your prescription.
          </p>
        </div>
      ) : (
        <div className="row g-3">

          {/* Left — Drug selector */}
          <div className="col-12 col-lg-4">
            <div className="card-custom">
              <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--muted)' }}>
                YOUR PRESCRIPTIONS
              </h6>
              {prescriptions.map(rx => (
                <div
                  key={rx.id}
                  onClick={() => setSelectedId(rx.id)}
                  style={{
                    padding: '0.85rem',
                    marginBottom: '0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${selectedId === rx.id ? '#C9A84C' : '#e9ecef'}`,
                    backgroundColor: selectedId === rx.id ? '#fffbf0' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                    💊 {rx.medication_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    🩺 {rx.diagnosis}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    👨‍⚕️ {rx.doctor_username}
                  </div>
                  <div style={{ marginTop: '0.3rem' }}>
                    <span style={{
                      backgroundColor: rx.status === 'active' ? '#d1e7dd' : '#fff3cd',
                      color: rx.status === 'active' ? '#0f5132' : '#856404',
                      borderRadius: '999px',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {rx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Schedule detail */}
          <div className="col-12 col-lg-8">

            {selectedPrescription && (
              <>
                {/* Prescription info card */}
                <div className="card-custom mb-3">
                  <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    💊 {selectedPrescription.medication_name}
                  </h6>
                  <div className="row g-3">
                    <div className="col-6 col-md-3 text-center">
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#C9A84C' }}>
                        {selectedPrescription.dosage || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Dosage</div>
                    </div>
                    <div className="col-6 col-md-3 text-center">
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6f42c1' }}>
                        {selectedSchedules.length}x
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Times/Day</div>
                    </div>
                    <div className="col-6 col-md-3 text-center">
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#212529' }}>
                        {selectedPrescription.diagnosis}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Diagnosis</div>
                    </div>
                    <div className="col-6 col-md-3 text-center">
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#212529', textTransform: 'capitalize' }}>
                        {selectedPrescription.status}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Status</div>
                    </div>
                  </div>
                </div>

                {/* Schedule details */}
                {selectedSchedules.length === 0 ? (
                  <div className="card-custom text-center" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    <h6 style={{ fontWeight: 700 }}>Schedule Pending</h6>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      The pharmacist hasn't added dosage details yet. Check back soon.
                    </p>
                  </div>
                ) : (
                  <div className="card-custom">
                    <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                      ⏰ Reminder Schedule
                    </h6>
                    {selectedSchedules.map((schedule, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef',
                          backgroundColor: '#fff',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            🕐 {schedule.reminder_time || schedule.time || `Dose ${i + 1}`}
                          </div>
                          {schedule.frequency && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              {schedule.frequency}
                            </div>
                          )}
                          {schedule.duration && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              Duration: {schedule.duration}
                            </div>
                          )}
                        </div>
                        <span style={{
                          backgroundColor: '#e8f0fe',
                          color: '#C9A84C',
                          borderRadius: '999px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}>
                          Active
                        </span>
                      </div>
                    ))}

                    {/* Reminder times summary */}
                    {reminderTimes.length > 0 && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#f8f9ff',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                      }}>
                        <span style={{ fontWeight: 600 }}>⏰ Reminder times: </span>
                        {reminderTimes.join(' · ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Prescription dates */}
                <div className="card-custom mt-3">
                  <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    📋 Prescription Info
                  </h6>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    <div style={{ marginBottom: '0.4rem' }}>
                      📅 <strong>Issued:</strong> {new Date(selectedPrescription.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      👨‍⚕️ <strong>Doctor:</strong> {selectedPrescription.doctor_username}
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      💊 <strong>Drug:</strong> {selectedPrescription.medication_name}
                    </div>
                    <div>
                      📦 <strong>Dosage:</strong> {selectedPrescription.dosage || 'Pending pharmacist'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default MedicationSchedule;