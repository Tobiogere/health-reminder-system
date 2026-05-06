import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import useAuth from '../../hooks/useAuth';
import AddDosageDetails from './AddDosageDetails';

const PrescriptionQueue = () => {
  const { user }                          = useAuth();
  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [queue, setQueue]                 = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus]   = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);

  const token = localStorage.getItem('token');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/prescriptions/queue', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setQueue(data);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchQueue(); }, []);

  const handleDosageSubmit = async (dosageData) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/prescriptions/${selectedPrescription.id}/dosage`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ dosages: dosageData.dosages }),
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedPrescription(null);
        fetchQueue();
        alert(`Schedule generated for ${dosageData.patientName}.`);
      } else {
        alert(data.message || 'Failed to add dosage.');
      }
    } catch (err) {
      alert('Could not connect to server. Please try again.');
    }
  };

  const filtered = queue.filter(rx => {
    const matchesStatus = filterStatus === 'all' || rx.status.toLowerCase() === filterStatus;
    const matchesSearch =
      (rx.patientName    || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rx.diagnosis      || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rx.medicationName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = queue.filter(r => r.status === 'pending').length;
  const activeCount  = queue.filter(r => r.status === 'active').length;

  if (selectedPrescription) {
    return (
      <PageWrapper
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          📋 Prescription Queue
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          All prescriptions sent from doctors
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading queue...</p>
        </div>
      ) : (
        <>
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
                  {activeCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Processed</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
                  {queue.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
                  {queue.length > 0 ? Math.round((activeCount / queue.length) * 100) : 0}%
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
                placeholder="Search patient or diagnosis..."
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
                <option value="active">Processed</option>
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
                    border: `1px solid ${rx.status === 'pending' ? '#ffc107' : '#b7ebc8'}`,
                    backgroundColor: rx.status === 'pending' ? '#fffdf0' : '#f0fff4',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{rx.patientName}</span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          backgroundColor: rx.status === 'pending' ? '#fff3cd' : '#d1e7dd',
                          color:           rx.status === 'pending' ? '#856404' : '#0f5132',
                          textTransform: 'capitalize',
                        }}>
                          {rx.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                        📅 {new Date(rx.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      <div style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                        🩺 <strong>Diagnosis:</strong> {rx.diagnosis}
                      </div>
                      <div style={{ fontSize: '0.82rem' }}>
                        💊 <strong>Drug:</strong> {rx.medicationName}
                      </div>
                    </div>

                    {rx.status === 'pending' ? (
                      <button
                        onClick={() => setSelectedPrescription({
                          ...rx,
                          drugs: [rx.medicationName],
                        })}
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
        </>
      )}
    </PageWrapper>
  );
};

export default PrescriptionQueue;