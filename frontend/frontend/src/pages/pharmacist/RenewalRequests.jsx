import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';

const statusStyles = {
  pending:  { bg: '#fff3cd', color: '#856404' },
  approved: { bg: '#d1e7dd', color: '#0f5132' },
  rejected: { bg: '#f8d7da', color: '#842029' },
};

const RenewalRequests = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(window.innerWidth > 768);
  const [renewals, setRenewals]         = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(true);

  const token = localStorage.getItem('token');

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/renewals/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setRenewals(data);
      }
    } catch (err) {
      console.error('Error fetching renewals:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRenewals(); }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/renewals/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });
      if (res.ok) {
        setRenewals(renewals.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      }
    } catch (err) {
      console.error('Error approving renewal:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/renewals/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });
      if (res.ok) {
        setRenewals(renewals.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      }
    } catch (err) {
      console.error('Error rejecting renewal:', err);
    }
  };

  const filtered = renewals.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status.toLowerCase() === filterStatus;
    const matchesSearch =
      (r.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.patientId   || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.drug        || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount  = renewals.filter(r => r.status === 'pending').length;
  const approvedCount = renewals.filter(r => r.status === 'approved').length;
  const rejectedCount = renewals.filter(r => r.status === 'rejected').length;

  return (
    <PageWrapper
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          🔄 Renewal Requests
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          Patient medication renewal requests
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading renewals...</p>
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
                  {approvedCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Approved</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#dc3545' }}>
                  {rejectedCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Rejected</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-custom text-center" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#C9A84C' }}>
                  {renewals.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Total</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card-custom mb-3">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search patient, ID or drug..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Renewal list */}
          <div className="card-custom">
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                No renewal requests found.
              </p>
            ) : (
              filtered.map(r => {
                const style = statusStyles[r.status] || statusStyles.pending;
                return (
                  <div
                    key={r.id}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${
                        r.status === 'approved' ? '#b7ebc8' :
                        r.status === 'rejected' ? '#f5c2c7' : '#ffc107'
                      }`,
                      backgroundColor:
                        r.status === 'approved' ? '#f0fff4' :
                        r.status === 'rejected' ? '#fff5f5' : '#fffdf0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{r.patientName}</span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            backgroundColor: style.bg,
                            color: style.color,
                            textTransform: 'capitalize',
                          }}>
                            {r.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                          ID: {r.patientId} · Requested: {new Date(r.requestDate).toLocaleDateString('en-GB')}
                        </div>
                        <div style={{ fontSize: '0.82rem', marginBottom: r.note ? '0.3rem' : 0 }}>
                          💊 <strong>Drug:</strong> {r.drug}
                        </div>
                        {r.note && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                            📝 "{r.note}"
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                        {r.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              style={{
                                backgroundColor: '#198754',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.35rem 0.85rem',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              style={{
                                backgroundColor: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.35rem 0.85rem',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              ❌ Reject
                            </button>
                          </>
                        ) : (
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: style.color,
                            textTransform: 'capitalize',
                          }}>
                            {r.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                          </span>
                        )}
                      </div>
                    </div>
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

export default RenewalRequests;