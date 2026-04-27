import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import useWindowSize from '../../hooks/useWindowSize';

// ── Dummy Data (replace with API later) ──────────────────────
const initialSuggestions = [
  { id: 1, drug: 'Artemether 80mg',        suggestedBy: 'Dr. Adebayo', date: '19 Apr 2026', status: 'Pending'  },
  { id: 2, drug: 'Cefuroxime 250mg',       suggestedBy: 'Dr. Okafor',  date: '18 Apr 2026', status: 'Pending'  },
  { id: 3, drug: 'Tramadol Injection 50mg', suggestedBy: 'Dr. Adebayo', date: '17 Apr 2026', status: 'Approved' },
  { id: 4, drug: 'Codeine Syrup 15mg',     suggestedBy: 'Dr. Okafor',  date: '15 Apr 2026', status: 'Rejected' },
];
// ─────────────────────────────────────────────────────────────

const statusStyles = {
  Pending:  { bg: '#fff3cd', color: '#856404' },
  Approved: { bg: '#d1e7dd', color: '#0f5132' },
  Rejected: { bg: '#f8d7da', color: '#842029' },
};

const AdminDrugs = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(window.innerWidth > 768);
  const [suggestions, setSuggestions]   = useState(initialSuggestions);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  const filtered = suggestions.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status.toLowerCase() === filterStatus;
    const matchesSearch =
      s.drug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.suggestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount  = suggestions.filter(s => s.status === 'Pending').length;
  const approvedCount = suggestions.filter(s => s.status === 'Approved').length;
  const rejectedCount = suggestions.filter(s => s.status === 'Rejected').length;

  const handleApprove = (id) => {
    // TODO: Replace with API call — PATCH /drugs/:id/approve
    setSuggestions(suggestions.map(s =>
      s.id === id ? { ...s, status: 'Approved' } : s
    ));
  };

  const handleReject = (id) => {
    // TODO: Replace with API call — PATCH /drugs/:id/reject
    setSuggestions(suggestions.map(s =>
      s.id === id ? { ...s, status: 'Rejected' } : s
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
            💊 Drug Suggestions
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            Review and approve drug suggestions from doctors
          </p>
        </div>

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fd7e14' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Pending Review</div>
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
                {suggestions.length}
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
              placeholder="Search drug or doctor..."
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

        {/* Suggestions list */}
        <div className="card-custom">
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              No drug suggestions found.
            </p>
          ) : (
            filtered.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  marginBottom: '0.6rem',
                  borderRadius: '8px',
                  border: `1px solid ${
                    s.status === 'Approved' ? '#b7ebc8' :
                    s.status === 'Rejected' ? '#f5c2c7' : '#ffc107'
                  }`,
                  backgroundColor:
                    s.status === 'Approved' ? '#f0fff4' :
                    s.status === 'Rejected' ? '#fff5f5' : '#fffdf0',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                {/* Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      🆕 {s.drug}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      backgroundColor: statusStyles[s.status].bg,
                      color:           statusStyles[s.status].color,
                    }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    Suggested by {s.suggestedBy} · {s.date}
                  </div>
                </div>

                {/* Actions */}
                {s.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleApprove(s.id)}
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
                      ✅ Add to List
                    </button>
                    <button
                      onClick={() => handleReject(s.id)}
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
                      ❌ Dismiss
                    </button>
                  </div>
                ) : (
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: statusStyles[s.status].color,
                  }}>
                    {s.status === 'Approved' ? '✅ Added to List' : '❌ Dismissed'}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Info box */}
        <div style={{
          marginTop: '1rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#f8f9ff',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          fontSize: '0.78rem',
          color: 'var(--muted)',
        }}>
          ℹ️ Approved drugs are permanently added to the prescription drug list and will be available to all doctors immediately after backend integration.
        </div>

      </div>
    </div>
  );
};

export default AdminDrugs;