import React from 'react';

// Dummy missed doses — replace with API call later
// GET /missed-doses — returns patients with missed doses today
const missedDoseAlerts = [
  { id: 1, patientName: 'Chukwuemeka Obi', drug: 'Paracetamol 500mg', time: '08:00 AM', missedAt: '09:35 AM' },
  { id: 2, patientName: 'Grace Eze',       drug: 'Amoxicillin 500mg', time: '08:00 AM', missedAt: '09:32 AM' },
];

const MissedDoseAlert = () => {
  if (missedDoseAlerts.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: '#fff5f5',
        border: '1px solid #f5c2c7',
        borderRadius: '10px',
        padding: '1rem 1.2rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <h6 style={{ fontWeight: 700, color: '#842029', margin: 0, fontSize: '0.95rem' }}>
          Missed Dose Alerts — {missedDoseAlerts.length} Patient{missedDoseAlerts.length > 1 ? 's' : ''}
        </h6>
      </div>
      {missedDoseAlerts.map(alert => (
        <div
          key={alert.id}
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
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <span style={{ fontWeight: 600, color: '#842029' }}>
              {alert.patientName}
            </span>
            <span style={{ color: 'var(--muted)', marginLeft: '0.4rem' }}>
              missed {alert.drug} due at {alert.time}
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
            Missed at {alert.missedAt}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MissedDoseAlert;