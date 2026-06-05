import React, { useState } from 'react';
import useNotifications from '../hooks/useNotifications';

const MissedDoseAlert = () => {
  const { getMissedDoses }  = useNotifications();
  const [expanded, setExpanded] = useState(false);
  const missedDoses = getMissedDoses();

  if (missedDoses.length === 0) return null;

  const visibleDoses = expanded ? missedDoses : missedDoses.slice(0, 2);

  return (
    <div style={{
      backgroundColor: '#fff5f5',
      border: '1px solid #f5c2c7',
      borderRadius: '10px',
      padding: '0.85rem 1.2rem',
      marginBottom: '1.5rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: missedDoses.length > 0 ? '0.6rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <h6 style={{ fontWeight: 700, color: '#842029', margin: 0, fontSize: '0.9rem' }}>
            Missed Dose Alerts — {missedDoses.length} Patient{missedDoses.length > 1 ? 's' : ''}
          </h6>
        </div>
        {missedDoses.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', color: '#842029',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', padding: 0,
            }}
          >
            {expanded ? '▲ Show less' : `▼ Show all ${missedDoses.length}`}
          </button>
        )}
      </div>

      {/* Compact list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {visibleDoses.map(alert => (
          <div key={alert.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.4rem 0.75rem', backgroundColor: '#fff',
            borderRadius: '6px', border: '1px solid #f5c2c7',
            fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#842029' }}>
                {alert.drug || 'Medication'}
              </span>
              <span style={{ color: 'var(--muted)' }}>{alert.message}</span>
            </div>
            <span style={{
              backgroundColor: '#f8d7da', color: '#842029',
              borderRadius: '999px', padding: '0.1rem 0.5rem',
              fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap',
            }}>
              {alert.time ? `Due at ${alert.time}` : 'Missed'}
            </span>
          </div>
        ))}
      </div>

      {!expanded && missedDoses.length > 2 && (
        <p style={{ fontSize: '0.75rem', color: '#842029', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
          +{missedDoses.length - 2} more missed dose{missedDoses.length - 2 > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default MissedDoseAlert;