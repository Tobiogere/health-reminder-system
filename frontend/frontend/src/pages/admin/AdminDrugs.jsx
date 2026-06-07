import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';

const statusStyles = {
  pending:  { bg: '#fff3cd', color: '#856404' },
  approved: { bg: '#d1e7dd', color: '#0f5132' },
  rejected: { bg: '#f8d7da', color: '#842029' },
};

const AdminDrugs = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(window.innerWidth > 768);
  const [suggestions, setSuggestions]   = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(true);

  const token = localStorage.getItem('token');

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/drugs/suggestions', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setSuggestions(data);
    } catch (err) {
      console.error('Error fetching drug suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSuggestions(); }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/drugs/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: 'approved' } : s));
    } catch (err) {
      console.error('Error approving drug:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/drugs/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    } catch (err) {
      console.error('Error rejecting drug:', err);
    }
  };

  const filtered = suggestions.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch =
      (s.drug        || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.suggestedBy || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount  = suggestions.filter(s => s.status === 'pending').length;
  const approvedCount = suggestions.filter(s => s.status === 'approved').length;
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length;

  return (
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onCloseSidebar={() => setSidebarOpen(false)}>

      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>💊 Drug Suggestions</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          Review drugs suggested by doctors — approve to add to the prescription list
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading suggestions...</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Pending Review', value: pendingCount,  color: '#fd7e14' },
              { label: 'Approved',       value: approvedCount, color: '#198754' },
              { label: 'Rejected',       value: rejectedCount, color: '#dc3545' },
              { label: 'Total',          value: suggestions.length, color: '#C9A84C' },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="card-custom text-center" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card-custom mb-3">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" className="form-control form-control-sm"
                placeholder="Search drug or doctor..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }} />
              <select className="form-select form-select-sm" value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)} style={{ width: '140px' }}>
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
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💊</div>
                <p style={{ fontSize: '0.88rem' }}>
                  {suggestions.length === 0
                    ? 'No drug suggestions yet. When doctors add drugs manually, they will appear here.'
                    : 'No suggestions match your filter.'}
                </p>
              </div>
            ) : (
              filtered.map(s => {
                const style = statusStyles[s.status] || statusStyles.pending;
                return (
                  <div key={s.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.85rem 1rem', marginBottom: '0.6rem', borderRadius: '8px',
                    border: `1px solid ${s.status === 'approved' ? '#b7ebc8' : s.status === 'rejected' ? '#f5c2c7' : '#ffc107'}`,
                    backgroundColor: s.status === 'approved' ? '#f0fff4' : s.status === 'rejected' ? '#fff5f5' : '#fffdf0',
                    flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>🆕 {s.drug}</span>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                          borderRadius: '999px', backgroundColor: style.bg, color: style.color,
                          textTransform: 'capitalize',
                        }}>{s.status}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        Suggested by {s.suggestedBy} · {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    {s.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleApprove(s.id)} style={{
                          backgroundColor: '#198754', color: '#fff', border: 'none',
                          borderRadius: '6px', padding: '0.35rem 0.85rem',
                          fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                        }}>✅ Add to List</button>
                        <button onClick={() => handleReject(s.id)} style={{
                          backgroundColor: '#dc3545', color: '#fff', border: 'none',
                          borderRadius: '6px', padding: '0.35rem 0.85rem',
                          fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                        }}>❌ Dismiss</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: style.color }}>
                        {s.status === 'approved' ? '✅ Added to List' : '❌ Dismissed'}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={{
            marginTop: '1rem', padding: '0.85rem 1rem', backgroundColor: '#f8f9ff',
            borderRadius: '8px', border: '1px solid #e9ecef', fontSize: '0.78rem', color: 'var(--muted)',
          }}>
            ℹ️ Approved drugs are immediately added to the prescription drug list and available to all doctors.
          </div>
        </>
      )}
    </PageWrapper>
  );
};

export default AdminDrugs;