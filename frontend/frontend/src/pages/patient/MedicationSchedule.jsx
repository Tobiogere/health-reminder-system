import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';

// ── Dummy Data (replace with API later) ──────────────────────
const scheduleData = [
  {
    id: 1,
    drug: 'Paracetamol 500mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '7 days',
    startDate: '18 Apr 2026',
    endDate: '25 Apr 2026',
    times: ['08:00 AM', '08:00 PM'],
    doctor: 'Dr. Adebayo',
    diagnosis: 'Malaria',
    dailyLog: {
      '2026-04-18': { '08:00 AM': 'taken', '08:00 PM': 'taken' },
      '2026-04-19': { '08:00 AM': 'missed', '08:00 PM': 'pending' },
      '2026-04-20': { '08:00 AM': 'pending', '08:00 PM': 'pending' },
    },
  },
  {
    id: 2,
    drug: 'Amoxicillin 250mg',
    dosage: '1 capsule',
    frequency: 'Three times daily',
    duration: '7 days',
    startDate: '18 Apr 2026',
    endDate: '25 Apr 2026',
    times: ['08:00 AM', '02:00 PM', '08:00 PM'],
    doctor: 'Dr. Adebayo',
    diagnosis: 'Malaria',
    dailyLog: {
      '2026-04-18': { '08:00 AM': 'taken', '02:00 PM': 'taken', '08:00 PM': 'taken' },
      '2026-04-19': { '08:00 AM': 'missed', '02:00 PM': 'pending', '08:00 PM': 'pending' },
      '2026-04-20': { '08:00 AM': 'pending', '02:00 PM': 'pending', '08:00 PM': 'pending' },
    },
  },
  {
    id: 3,
    drug: 'Vitamin C 1000mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '7 days',
    startDate: '18 Apr 2026',
    endDate: '25 Apr 2026',
    times: ['08:00 AM'],
    doctor: 'Dr. Adebayo',
    diagnosis: 'Malaria',
    dailyLog: {
      '2026-04-18': { '08:00 AM': 'taken' },
      '2026-04-19': { '08:00 AM': 'pending' },
      '2026-04-20': { '08:00 AM': 'pending' },
    },
  },
];

const days = ['2026-04-18', '2026-04-19', '2026-04-20'];
const dayLabels = ['Apr 18', 'Apr 19', 'Apr 20'];

const statusStyles = {
  taken:   { bg: '#d1e7dd', color: '#0f5132', label: '✅ Taken'   },
  missed:  { bg: '#f8d7da', color: '#842029', label: '❌ Missed'  },
  pending: { bg: '#f8f9fa', color: '#6c757d', label: '⏳ Pending' },
};
// ─────────────────────────────────────────────────────────────

const MedicationSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [selectedDrug, setSelectedDrug] = useState(scheduleData[0]);
  const windowWidth = useWindowSize();
  const isMobile = windowWidth <= 768;

  const takenCount  = Object.values(selectedDrug.dailyLog)
    .flatMap(day => Object.values(day))
    .filter(s => s === 'taken').length;

  const missedCount = Object.values(selectedDrug.dailyLog)
    .flatMap(day => Object.values(day))
    .filter(s => s === 'missed').length;

  const totalCount = Object.values(selectedDrug.dailyLog)
    .flatMap(day => Object.values(day)).length;

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
            📅 My Medication Schedule
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Track your full medication plan and daily progress
          </p>
        </div>

        <div className="row g-3">

          {/* Left — Drug selector */}
          <div className="col-12 col-lg-4">
            <div className="card-custom">
              <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--muted)' }}>
                YOUR MEDICATIONS
              </h6>
              {scheduleData.map(drug => (
                <div
                  key={drug.id}
                  onClick={() => setSelectedDrug(drug)}
                  style={{
                    padding: '0.85rem',
                    marginBottom: '0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${selectedDrug.id === drug.id ? '#0d6efd' : '#e9ecef'}`,
                    backgroundColor: selectedDrug.id === drug.id ? '#f0f5ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                    💊 {drug.drug}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {drug.frequency} · {drug.duration}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {drug.startDate} → {drug.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Schedule detail */}
          <div className="col-12 col-lg-8">

            {/* Drug info card */}
            <div className="card-custom mb-3">
              <div className="row g-3">
                <div className="col-6 col-md-3 text-center">
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0d6efd' }}>
                    {selectedDrug.dosage}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Dosage</div>
                </div>
                <div className="col-6 col-md-3 text-center">
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6f42c1' }}>
                    {selectedDrug.times.length}x
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Per Day</div>
                </div>
                <div className="col-6 col-md-3 text-center">
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#198754' }}>
                    {takenCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Doses Taken</div>
                </div>
                <div className="col-6 col-md-3 text-center">
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc3545' }}>
                    {missedCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Doses Missed</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                  <span>Overall Progress</span>
                  <span>{Math.round((takenCount / totalCount) * 100)}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '999px' }}>
                  <div style={{
                    height: '100%',
                    width: `${(takenCount / totalCount) * 100}%`,
                    backgroundColor: '#198754',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* Daily schedule grid */}
            <div className="card-custom">
              <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                Daily Breakdown
              </h6>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid #e9ecef', textAlign: 'left' }}>
                        Time
                      </th>
                      {days.map((day, i) => (
                        <th key={day} style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--muted)', borderBottom: '1px solid #e9ecef', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {dayLabels[i]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDrug.times.map(time => (
                      <tr key={time} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>
                          🕐 {time}
                        </td>
                        {days.map(day => {
                          const status = selectedDrug.dailyLog[day]?.[time] || 'pending';
                          const style  = statusStyles[status];
                          return (
                            <td key={day} style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                              <span style={{
                                backgroundColor: style.bg,
                                color: style.color,
                                borderRadius: '999px',
                                padding: '0.2rem 0.6rem',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}>
                                {style.label}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Times reminder */}
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8f9ff', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 600 }}>⏰ Reminder times: </span>
                {selectedDrug.times.join(' · ')}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationSchedule;