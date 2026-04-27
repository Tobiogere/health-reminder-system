import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';

// ── Dummy Data (replace with API later) ──────────────────────
const myPrescriptions = [
  {
    id: 1,
    patientName: 'Chukwuemeka Obi',
    patientId:   'STU/2024/001',
    diagnosis:   'Malaria',
    drugs: [
      { name: 'Paracetamol 500mg', dosage: '1 tablet',  frequency: 'Twice daily',        duration: '7 days' },
      { name: 'Coartem',           dosage: '1 tablet',  frequency: 'Twice daily',        duration: '3 days' },
    ],
    date:   '18 Apr 2026',
    status: 'Processed',
    notes:  'Take after meals',
  },
  {
    id: 2,
    patientName: 'Amina Bello',
    patientId:   'STU/2024/042',
    diagnosis:   'Typhoid Fever',
    drugs: [
      { name: 'Ciprofloxacin 500mg', dosage: '1 tablet', frequency: 'Twice daily',       duration: '10 days' },
      { name: 'ORS',                 dosage: '1 sachet', frequency: 'Three times daily', duration: '5 days'  },
    ],
    date:   '17 Apr 2026',
    status: 'Processed',
    notes:  '',
  },
  {
    id: 3,
    patientName: 'Grace Eze',
    patientId:   '08031234567',
    diagnosis:   'Upper RTI',
    drugs: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Three times daily', duration: '7 days' },
      { name: 'Vitamin C 1000mg',  dosage: '1 tablet',  frequency: 'Once daily',        duration: '7 days' },
    ],
    date:   '16 Apr 2026',
    status: 'Pending',
    notes:  'Monitor temperature daily',
  },
];
// ─────────────────────────────────────────────────────────────

const DoctorPrescriptions = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(window.innerWidth > 768);
  const [expandedId, setExpandedId]     = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const filtered = myPrescriptions.filter(rx => {
    const matchesStatus = filterStatus === 'all' || rx.status.toLowerCase() === filterStatus;
    const matchesSearch =
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount   = myPrescriptions.filter(r => r.status === 'Pending').length;
  const processedCount = myPrescriptions.filter(r => r.status === 'Processed').length;

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
            📋 My Prescriptions
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            All prescriptions you have written
          </p>
        </div>

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d6efd' }}>
                {myPrescriptions.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Written</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
                {processedCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Processed</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pending Pharmacy</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
                {myPrescriptions.reduce((acc, rx) => acc + rx.drugs.length, 0)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Drugs</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-custom mb-3">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search patient, ID or diagnosis..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
            </select>
          </div>
        </div>

        {/* Prescription list */}
        <div className="card-custom">
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              No prescriptions found.
            </p>
          ) : (
            filtered.map(rx => (
              <div
                key={rx.id}
                style={{
                  marginBottom: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  overflow: 'hidden',
                }}
              >
                {/* Header row — always visible */}
                <div
                  onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    backgroundColor: expandedId === rx.id ? '#f0f8f4' : '#fff',
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    transition: 'background 0.15s',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {rx.patientName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {rx.patientId}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                      🩺 {rx.diagnosis} · 📅 {rx.date}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      backgroundColor: rx.status === 'Processed' ? '#d1e7dd' : '#fff3cd',
                      color:           rx.status === 'Processed' ? '#0f5132' : '#856404',
                      borderRadius: '999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}>
                      {rx.status === 'Processed' ? '✅ Processed' : '⏳ Pending'}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {expandedId === rx.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded drug details */}
                {expandedId === rx.id && (
                  <div style={{ padding: '0 1rem 1rem 1rem', backgroundColor: '#fafffe' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
                      PRESCRIBED DRUGS
                    </div>
                    {rx.drugs.map((drug, i) => (
                      <div
                        key={i}
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
                    {rx.notes && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        backgroundColor: '#fff3cd',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        color: '#856404',
                        fontStyle: 'italic',
                      }}>
                        📝 Note: {rx.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorPrescriptions;