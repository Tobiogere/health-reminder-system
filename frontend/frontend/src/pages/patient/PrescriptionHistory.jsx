import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';

// ── Dummy Data (replace with API later) ──────────────────────
const prescriptions = [
  {
    id: 1,
    date: '10 Apr 2026',
    doctor: 'Dr. Adebayo',
    diagnosis: 'Malaria',
    status: 'Completed',
    drugs: [
      { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice daily',       duration: '7 days' },
      { name: 'Coartem',           dosage: '1 tablet', frequency: 'Twice daily',       duration: '3 days' },
    ],
  },
  {
    id: 2,
    date: '22 Mar 2026',
    doctor: 'Dr. Okafor',
    diagnosis: 'Typhoid Fever',
    status: 'Completed',
    drugs: [
      { name: 'Ciprofloxacin 500mg', dosage: '1 tablet', frequency: 'Twice daily',    duration: '10 days' },
      { name: 'ORS',                 dosage: '1 sachet', frequency: 'Three times daily', duration: '5 days' },
    ],
  },
  {
    id: 3,
    date: '14 Feb 2026',
    doctor: 'Dr. Adebayo',
    diagnosis: 'Upper Respiratory Tract Infection',
    status: 'Completed',
    drugs: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Three times daily', duration: '7 days' },
      { name: 'Vitamin C 1000mg',  dosage: '1 tablet',  frequency: 'Once daily',        duration: '7 days' },
    ],
  },
];
// ─────────────────────────────────────────────────────────────

const PrescriptionHistory = () => {
  const [sidebarOpen, setSidebarOpen]       = useState(window.innerWidth > 768);
  const [expandedId, setExpandedId]         = useState(null);
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
            📋 Prescription History
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            All your past prescriptions from the health centre
          </p>
        </div>

        {/* Summary */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d6efd' }}>
                {prescriptions.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Prescriptions</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
                {prescriptions.filter(p => p.status === 'Completed').length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Completed</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
                {[...new Set(prescriptions.map(p => p.doctor))].length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Doctors Seen</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
                {prescriptions.reduce((acc, p) => acc + p.drugs.length, 0)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Drugs</div>
            </div>
          </div>
        </div>

        {/* Prescription list */}
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
            All Prescriptions
          </h5>

          {prescriptions.map((rx, i) => (
            <div
              key={rx.id}
              style={{
                marginBottom: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                overflow: 'hidden',
              }}
            >
              {/* Prescription header — always visible */}
              <div
                onClick={() => toggleExpand(rx.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  backgroundColor: expandedId === rx.id ? '#f0f5ff' : '#fff',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  transition: 'background 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                    🩺 {rx.diagnosis}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {rx.doctor} · {rx.date}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {expandedId === rx.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expandable drug details */}
              {expandedId === rx.id && (
                <div style={{ padding: '0 1rem 1rem 1rem', backgroundColor: '#fafbff' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
                    PRESCRIBED DRUGS
                  </div>
                  {rx.drugs.map((drug, di) => (
                    <div
                      key={di}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.75rem',
                        marginBottom: '0.4rem',
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>💊 {drug.name}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                          {drug.dosage} · {drug.frequency} · {drug.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PrescriptionHistory;