import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';

const PrescriptionHistory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [expandedId, setExpandedId]   = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token      = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!storedUser?.id) {
        setError('User session not found. Please login again.');
        return;
      }

      const res = await fetch(`http://127.0.0.1:8000/patients/${storedUser.id}/prescriptions`, {
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
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const statusColor = (status) => {
    if (status === 'active')    return { bg: '#d1e7dd', text: '#0f5132' };
    if (status === 'pending')   return { bg: '#fff3cd', text: '#856404' };
    if (status === 'completed') return { bg: '#e2e3e5', text: '#41464b' };
    return { bg: '#e2e3e5', text: '#41464b' };
  };

  const uniqueDoctors = [...new Set(prescriptions.map(p => p.doctorName))].length;

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          📋 Prescription History
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          All your past prescriptions from the health centre
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
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
                  {prescriptions.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total Prescriptions</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#198754' }}>
                  {prescriptions.filter(p => p.status === 'active').length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Active</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
                  {prescriptions.filter(p => p.status === 'pending').length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pending</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6f42c1' }}>
                  {uniqueDoctors}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Doctors Seen</div>
              </div>
            </div>
          </div>

          {/* Prescription List */}
          <div className="card-custom">
            <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
              All Prescriptions
            </h5>

            {prescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <p>No prescriptions found. Visit the health centre to get started.</p>
              </div>
            ) : (
              prescriptions.map((rx) => {
                const colors = statusColor(rx.status);
                return (
                  <div
                    key={rx.id}
                    style={{
                      marginBottom: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header */}
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
                          👨‍⚕️ {rx.doctorName || 'Health Centre'} · {new Date(rx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          💊 {rx.medicationName} {rx.dosage ? `· ${rx.dosage}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderRadius: '999px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
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
                      <div style={{ padding: '0 1rem 1rem 1rem', backgroundColor: '#fafbff' }}>
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
                            👨‍⚕️ <strong>Doctor:</strong> {rx.doctorName || 'Health Centre'}
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
                );
              })
            )}
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default PrescriptionHistory;