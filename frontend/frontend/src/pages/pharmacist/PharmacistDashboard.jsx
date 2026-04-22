import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import AddDosageDetails from './AddDosageDetails';
import RenewalQueue from './RenewalQueue';
import MissedDoseAlert from '../../components/MissedDoseAlert';
import PageWrapper from '../../components/PageWrapper';

// ── Dummy Data (replace with API later) ──────────────────────
const prescriptionQueue = [
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
];

const renewalRequests = [
  {
    id: 1,
    patientName: 'Chukwuemeka Obi',
    patientId:   'STU/2024/001',
    drug:        'Paracetamol 500mg',
    requestDate: '18 Apr 2026',
    status:      'Pending',
  },
  {
    id: 2,
    patientName: 'Grace Eze',
    patientId:   '08031234567',
    drug:        'Vitamin C 1000mg',
    requestDate: '17 Apr 2026',
    status:      'Pending',
  },
];
// ─────────────────────────────────────────────────────────────

const PharmacistDashboard = () => {
  const { user }                                        = useAuth();
  const [sidebarOpen, setSidebarOpen]                   = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab]                       = useState('queue');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [queue, setQueue]                               = useState(prescriptionQueue);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const pendingCount   = queue.filter(p => p.status === 'Pending').length;
  const processedCount = queue.filter(p => p.status === 'Processed').length;
  const renewalCount   = renewalRequests.filter(r => r.status === 'Pending').length;

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleDosageSubmit = (dosageData) => {
    // TODO: Replace with API call — POST /prescriptions/:id/dosage
    console.log('Dosage submitted:', dosageData);
    setQueue(queue.map(p =>
      p.id === selectedPrescription.id ? { ...p, status: 'Processed' } : p
    ));
    setSelectedPrescription(null);
    alert(`Schedule generated for ${dosageData.patientName}. Patient will receive reminders.`);
  };

  // Show dosage form if prescription selected
  if (selectedPrescription) {
    return (
      <PageWrapper
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={() => setSidebarOpen(false)}
      >
        <AddDosageDetails
          prescription={selectedPrescription}
          pharmacistName={user?.name}
          onSubmit={handleDosageSubmit}
          onCancel={() => setSelectedPrescription(null)}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* ── Welcome Header ── */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          Welcome, {user?.name} 💊
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{today}</p>
      </div>

      {/* ── Missed Dose Alerts ── */}
      <MissedDoseAlert />

      {/* ── Summary Cards ── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pending Prescriptions</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
              {processedCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Processed Today</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
              {renewalCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Renewal Requests</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom text-center" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
              {queue.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Today</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #e9ecef' }}>
        {[
          { key: 'queue',    label: `📋 Prescription Queue (${pendingCount} pending)` },
          { key: 'renewals', label: `🔄 Renewal Requests (${renewalCount} pending)`  },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #6f42c1' : '2px solid transparent',
              marginBottom: '-2px',
              padding: '0.5rem 1rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? '#6f42c1' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Prescription Queue Tab ── */}
      {activeTab === 'queue' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
            📋 Prescription Queue
          </h5>
          {queue.map(rx => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{rx.patientName}</span>
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

                {rx.status === 'Pending' && (
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
                )}
                {rx.status === 'Processed' && (
                  <span style={{ fontSize: '0.82rem', color: '#198754', fontWeight: 600 }}>
                    ✅ Schedule Generated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Renewals Tab ── */}
      {activeTab === 'renewals' && (
        <RenewalQueue renewalRequests={renewalRequests} />
      )}

    </PageWrapper>
  );
};

export default PharmacistDashboard;