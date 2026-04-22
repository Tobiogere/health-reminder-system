import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';
import AddDosageDetails from './AddDosageDetails';
import useAuth from '../../hooks/useAuth';

// ── Dummy Data (replace with API later) ──────────────────────
const allPrescriptions = [
  {
    id: 1,
    patientName: 'Chukwuemeka Obi',
    patientId:   'STU/2024/001',
    doctor:      'Dr. Adebayo',
    diagnosis:   'Malaria',
    drugs:       ['Paracetamol 500mg', 'Coartem'],
    date:        '18 Apr 2026',
    status:      'Pending',
  },
  {
    id: 2,
    patientName: 'Amina Bello',
    patientId:   'STU/2024/042',
    doctor:      'Dr. Okafor',
    diagnosis:   'Typhoid',
    drugs:       ['Ciprofloxacin 500mg', 'ORS'],
    date:        '18 Apr 2026',
    status:      'Pending',
  },
  {
    id: 3,
    patientName: 'Grace Eze',
    patientId:   '08031234567',
    doctor:      'Dr. Adebayo',
    diagnosis:   'Upper RTI',
    drugs:       ['Amoxicillin 500mg', 'Vitamin C 1000mg'],
    date:        '17 Apr 2026',
    status:      'Processed',
  },
  {
    id: 4,
    patientName: 'Mr. Tunde Adeyemi',
    patientId:   'STF/2024/010',
    doctor:      'Dr. Okafor',
    diagnosis:   'Hypertension',
    drugs:       ['Amlodipine 5mg', 'Lisinopril 10mg'],
    date:        '17 Apr 2026',
    status:      'Processed',
  },
];
// ─────────────────────────────────────────────────────────────

const PrescriptionQueue = () => {
  const { user }                          = useAuth();
  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [queue, setQueue]                 = useState(allPrescriptions);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus]   = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const filtered = queue.filter(rx => {
    const matchesStatus = filterStatus === 'all' || rx.status.toLowerCase() === filterStatus;
    const matchesSearch =
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount   = queue.filter(r => r.status === 'Pending').length;
  const processedCount = queue.filter(r => r.status === 'Processed').length;

  const handleDosageSubmit = (dosageData) => {
    // TODO: Replace with API call — PATCH /prescriptions/:id/dosage
    setQueue(queue.map(rx =>
      rx.id === selectedPrescription.id ? { ...rx, status: 'Processed' } : rx
    ));
    setSelectedPrescription(null);
    alert(`Schedule generated for ${dosageData.patientName}.`);
  };

  // Show dosage form if prescription selected
  if (selectedPrescription) {
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
          <AddDosageDetails
            prescription={selectedPrescription}
            pharmacistName={user?.name}
            onSubmit={handleDosageSubmit}
            onCancel={() => setSelectedPrescription(null)}
          />
        </div>
      </div>
    );
  }

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
            📋 Prescription Queue
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            All prescriptions sent from doctors
          </p>
        </div>

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pending</div>
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
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d6efd' }}>
                {queue.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
                {queue.length > 0 ? Math.round((processedCount / queue.length) * 100) : 0}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Completion Rate</div>
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
              style={{ width: '140px' }}
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
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${rx.status === 'Pending' ? '#ffc107' : '#b7ebc8'}`,
                  backgroundColor: rx.status === 'Pending' ? '#fffdf0' : '#f0fff4',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {rx.patientName}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: rx.status === 'Pending' ? '#fff3cd' : '#d1e7dd',
                        color:           rx.status === 'Pending' ? '#856404' : '#0f5132',
                      }}>
                        {rx.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                      ID: {rx.patientId} · {rx.doctor} · {rx.date}
                    </div>
                    <div style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                      🩺 <strong>Diagnosis:</strong> {rx.diagnosis}
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      💊 <strong>Drugs:</strong> {rx.drugs.join(', ')}
                    </div>
                  </div>

                  {rx.status === 'Pending' ? (
                    <button
                      onClick={() => setSelectedPrescription(rx)}
                      style={{
                        backgroundColor: '#6f42c1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ➕ Add Dosage
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: '#198754', fontWeight: 600 }}>
                      ✅ Schedule Generated
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default PrescriptionQueue;