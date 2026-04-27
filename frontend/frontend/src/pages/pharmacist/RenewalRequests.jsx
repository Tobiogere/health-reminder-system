import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';

// ── Dummy Data (replace with API later) ──────────────────────
const allRenewals = [
  {
    id: 1,
    patientName: 'Chukwuemeka Obi',
    patientId:   'STU/2024/001',
    drug:        'Paracetamol 500mg',
    note:        'Running low, need refill before end date',
    requestDate: '19 Apr 2026',
    status:      'Pending',
  },
  {
    id: 2,
    patientName: 'Grace Eze',
    patientId:   '08031234567',
    drug:        'Vitamin C 1000mg',
    note:        '',
    requestDate: '18 Apr 2026',
    status:      'Pending',
  },
  {
    id: 3,
    patientName: 'Amina Bello',
    patientId:   'STU/2024/042',
    drug:        'Ciprofloxacin 500mg',
    note:        'Doctor said I can renew if symptoms persist',
    requestDate: '17 Apr 2026',
    status:      'Approved',
  },
  {
    id: 4,
    patientName: 'Mr. Tunde Adeyemi',
    patientId:   'STF/2024/010',
    drug:        'Amlodipine 5mg',
    note:        '',
    requestDate: '15 Apr 2026',
    status:      'Rejected',
  },
];
// ─────────────────────────────────────────────────────────────

const statusStyles = {
  Pending:  { bg: '#fff3cd', color: '#856404' },
  Approved: { bg: '#d1e7dd', color: '#0f5132' },
  Rejected: { bg: '#f8d7da', color: '#842029' },
};

const RenewalRequests = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [renewals, setRenewals]       = useState(allRenewals);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const filtered = renewals.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status.toLowerCase() === filterStatus;
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.drug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount  = renewals.filter(r => r.status === 'Pending').length;
  const approvedCount = renewals.filter(r => r.status === 'Approved').length;
  const rejectedCount = renewals.filter(r => r.status === 'Rejected').length;

  const handleApprove = (id) => {
    // TODO: Replace with API call — PATCH /renewals/:id/approve
    setRenewals(renewals.map(r =>
      r.id === id ? { ...r, status: 'Approved' } : r
    ));
  };

  const handleReject = (id) => {
    // TODO: Replace with API call — PATCH /renewals/:id/reject
    setRenewals(renewals.map(r =>
      r.id === id ? { ...r, status: 'Rejected' } : r
    ));
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
            🔄 Renewal Requests
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Patient medication renewal requests — no doctor involvement needed
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
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d6efd' }}>
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
            filtered.map(r => (
              <div
                key={r.id}
                style={{
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${
                    r.status === 'Approved' ? '#b7ebc8' :
                    r.status === 'Rejected' ? '#f5c2c7' : '#ffc107'
                  }`,
                  backgroundColor:
                    r.status === 'Approved' ? '#f0fff4' :
                    r.status === 'Rejected' ? '#fff5f5' : '#fffdf0',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {r.patientName}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: statusStyles[r.status].bg,
                        color:           statusStyles[r.status].color,
                      }}>
                        {r.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                      ID: {r.patientId} · Requested: {r.requestDate}
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

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    {r.status === 'Pending' ? (
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
                        color: statusStyles[r.status].color,
                      }}>
                        {r.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default RenewalRequests;