import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';

const DoctorPrescriptions = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(window.innerWidth > 768);
  const [expandedId, setExpandedId]     = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const token = localStorage.getItem('token');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));

      const res = await fetch(`http://127.0.0.1:8000/prescriptions/doctor/${storedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPrescriptions(data);
      } else {
        setError(data.message || 'Failed to load prescriptions.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPrescriptions(); }, []);

  const filtered = prescriptions.filter(rx => {
    const matchesStatus = filterStatus === 'all' || rx.status.toLowerCase() === filterStatus;
    const matchesSearch =
      (rx.patient_fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rx.patient_username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rx.diagnosis        || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rx.medicationName  || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = prescriptions.filter(r => r.status === 'pending').length;
  const activeCount  = prescriptions.filter(r => r.status === 'active').length;

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          📋 My Prescriptions
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          All prescriptions you have written
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading prescriptions...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
                  {prescriptions.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Written</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
                  {activeCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Active</div>
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
                  {prescriptions.filter(r => r.status === 'completed').length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Completed</div>
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
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
                  {/* Header row */}
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
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        🩺 {rx.diagnosis} · 💊 {rx.medicationName} · 📅 {new Date(rx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        backgroundColor: rx.status === 'active'    ? '#d1e7dd' :
                                         rx.status === 'pending'   ? '#fff3cd' : '#e2e3e5',
                        color:           rx.status === 'active'    ? '#0f5132' :
                                         rx.status === 'pending'   ? '#856404' : '#41464b',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                      }}>
                        {rx.status}
                      </span>
                      <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                        {expandedId === rx.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === rx.id && (
                    <div style={{ padding: '0 1rem 1rem 1rem', backgroundColor: '#fafffe' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
                        PRESCRIPTION DETAILS
                      </div>
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        fontSize: '0.82rem',
                      }}>
                        <div style={{ marginBottom: '0.4rem' }}>
                          💊 <strong>Drug:</strong> {rx.medicationName}
                        </div>
                        <div style={{ marginBottom: '0.4rem' }}>
                          📦 <strong>Dosage:</strong> {rx.dosage || 'Pending pharmacist'}
                        </div>
                        <div style={{ marginBottom: '0.4rem' }}>
                          🩺 <strong>Diagnosis:</strong> {rx.diagnosis}
                        </div>
                        <div style={{ marginBottom: '0.4rem' }}>
                          👤 <strong>Patient:</strong>{rx.patientName}
                        </div>
                        <div>
                          📅 <strong>Date:</strong> {new Date(rx.createdAt).toLocaleDateString('en-GB', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default DoctorPrescriptions;