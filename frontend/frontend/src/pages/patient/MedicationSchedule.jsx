import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';

const MedicationSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [schedules, setSchedules]     = useState([]);
  const [selectedId, setSelectedId]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [markingId, setMarkingId]     = useState(null);

  const token      = localStorage.getItem('token');
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem('user'));
  } catch {
    storedUser = null;
  }
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      if (!storedUser?.id) {
        setError('User session not found.');
        setLoading(false);
        return;
      }

      const res = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setSchedules(data);
        if (data.length > 0) setSelectedId(data[0].scheduleId);
      } else {
        setError('Failed to load schedule.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSchedule(); }, []);

  const markAsTaken = async (doseId) => {
    try {
      setMarkingId(doseId);
      const res = await fetch(`http://127.0.0.1:8000/medications/${doseId}/taken`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      if (res.ok) {
        setSchedules(prev => prev.map(s => ({
          ...s,
          doses: s.doses.map(d =>
            d.id === doseId ? { ...d, status: 'taken', takenAt: new Date().toISOString() } : d
          ),
        })));
      }
    } catch (err) {
      console.error('Error marking dose:', err);
    } finally {
      setMarkingId(null);
    }
  };

  const selected = schedules.find(s => s.scheduleId === selectedId);

  const today = new Date().toDateString();
  const todayDoses = selected?.doses.filter(d =>
    new Date(d.scheduledTime).toDateString() === today
  ) || [];

  const takenCount  = todayDoses.filter(d => d.status === 'taken').length;
  const missedCount = todayDoses.filter(d => d.status === 'missed').length;

  const statusStyle = (status) => {
    if (status === 'taken')  return { bg: '#d1e7dd', color: '#0f5132', label: '✅ Taken' };
    if (status === 'missed') return { bg: '#f8d7da', color: '#842029', label: '❌ Missed' };
    return { bg: '#f8f9fa', color: '#6c757d', label: '⏳ Pending' };
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  };

  // Group doses by date
  const groupedDoses = {};
  if (selected) {
    selected.doses.forEach(dose => {
      const dateKey = new Date(dose.scheduledTime).toDateString();
      if (!groupedDoses[dateKey]) groupedDoses[dateKey] = [];
      groupedDoses[dateKey].push(dose);
    });
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
      ) : schedules.length === 0 ? (
        <div className="card-custom text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h5 style={{ fontWeight: 700 }}>No Schedule Yet</h5>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            Your medication schedule will appear here once a pharmacist processes your prescription.
          </p>
        </div>
      ) : (
        <div className="row g-3">

          {/* Left — Medication selector */}
          <div className="col-12 col-lg-4">
            <div className="card-custom">
              <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--muted)' }}>
                YOUR MEDICATIONS
              </h6>
              {schedules.map(s => (
                <div
                  key={s.scheduleId}
                  onClick={() => setSelectedId(s.scheduleId)}
                  style={{
                    padding: '0.85rem', marginBottom: '0.5rem', borderRadius: '8px',
                    border: `2px solid ${selectedId === s.scheduleId ? '#C9A84C' : '#e9ecef'}`,
                    backgroundColor: selectedId === s.scheduleId ? '#fffbf0' : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                    💊 {s.medication}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {s.dosage} · {s.frequency}x daily · {s.duration} days
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    📅 {s.startDate} → {s.endDate}
                  </div>
                  <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {(s.specificTimes || []).map((t, i) => (
                      <span key={i} style={{
                        backgroundColor: '#e8f0fe', color: '#C9A84C',
                        borderRadius: '999px', padding: '0.1rem 0.5rem',
                        fontSize: '0.7rem', fontWeight: 600,
                      }}>⏰ {t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Schedule detail */}
          {selected && (
            <div className="col-12 col-lg-8">

              {/* Summary cards */}
              <div className="card-custom mb-3">
                <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                  💊 {selected.medication} — Today's Progress
                </h6>
                <div className="row g-3">
                  <div className="col-6 col-md-3 text-center">
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#C9A84C' }}>
                      {todayDoses.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Today's Doses</div>
                  </div>
                  <div className="col-6 col-md-3 text-center">
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#198754' }}>
                      {takenCount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Taken</div>
                  </div>
                  <div className="col-6 col-md-3 text-center">
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc3545' }}>
                      {missedCount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Missed</div>
                  </div>
                  <div className="col-6 col-md-3 text-center">
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6f42c1' }}>
                      {selected.duration}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Days Total</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                    <span>Today's Progress</span>
                    <span>{todayDoses.length > 0 ? Math.round((takenCount / todayDoses.length) * 100) : 0}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '999px' }}>
                    <div style={{
                      height: '100%',
                      width: `${todayDoses.length > 0 ? (takenCount / todayDoses.length) * 100 : 0}%`,
                      backgroundColor: '#198754', borderRadius: '999px', transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              </div>

              {/* Daily breakdown */}
              <div className="card-custom">
                <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                  📋 Full Schedule Breakdown
                </h6>
                {Object.entries(groupedDoses).map(([dateKey, doses]) => {
                  const isToday = dateKey === today;
                  return (
                    <div key={dateKey} style={{ marginBottom: '1rem' }}>
                      <div style={{
                        fontSize: '0.78rem', fontWeight: 700, color: isToday ? '#C9A84C' : 'var(--muted)',
                        marginBottom: '0.5rem', textTransform: 'uppercase',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                      }}>
                        {formatDate(doses[0].scheduledTime)}
                        {isToday && (
                          <span style={{
                            backgroundColor: '#C9A84C', color: '#fff',
                            borderRadius: '999px', padding: '0.1rem 0.5rem',
                            fontSize: '0.65rem',
                          }}>TODAY</span>
                        )}
                      </div>
                      {doses.map(dose => {
                        const style = statusStyle(dose.status);
                        const isPending = dose.status !== 'taken' && dose.status !== 'missed';
                        return (
                          <div key={dose.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.65rem 0.75rem', marginBottom: '0.4rem',
                            backgroundColor: style.bg, borderRadius: '6px',
                            border: `1px solid ${dose.status === 'taken' ? '#b7ebc8' : dose.status === 'missed' ? '#f5c2c7' : '#e9ecef'}`,
                          }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              🕐 {formatTime(dose.scheduledTime)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                backgroundColor: style.bg, color: style.color,
                                borderRadius: '999px', padding: '0.2rem 0.6rem',
                                fontSize: '0.72rem', fontWeight: 600,
                              }}>{style.label}</span>
                              {isPending && isToday && (
                                <button
                                  onClick={() => markAsTaken(dose.id)}
                                  disabled={markingId === dose.id}
                                  style={{
                                    backgroundColor: '#C9A84C', color: '#fff',
                                    border: 'none', borderRadius: '6px',
                                    padding: '0.25rem 0.65rem',
                                    fontSize: '0.72rem', fontWeight: 600,
                                    cursor: 'pointer', opacity: markingId === dose.id ? 0.7 : 1,
                                  }}
                                >
                                  {markingId === dose.id ? '...' : 'Mark Taken'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default MedicationSchedule;