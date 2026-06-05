import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import AddDosageDetails from './AddDosageDetails';
import MissedDoseAlert from '../../components/MissedDoseAlert';
import PageWrapper from '../../components/PageWrapper';

// ── Group prescriptions by patient + diagnosis + date ──
const groupQueue = (queue) => {
  const groups = {};
  queue.forEach(rx => {
    const date = new Date(rx.createdAt).toLocaleDateString('en-GB');
    const key  = `${rx.patientId}-${rx.diagnosis}-${date}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        patientName: rx.patientName,
        patientId:   rx.patientId,
        diagnosis:   rx.diagnosis,
        date,
        status:      rx.status,
        drugs:       [],
      };
    }

    groups[key].drugs.push({
      id:             rx.id,
      medicationName: rx.medicationName,
      status:         rx.status,
    });
    // If any drug is pending, group is pending
    if (rx.status === 'pending') groups[key].status = 'pending';

    // const key = `${rx.patientId}-${rx.diagnosis}-${date}`;
console.log('Key:', key, '| Drug:', rx.medicationName);
  });

  
  return Object.values(groups);
};


const PharmacistDashboard = () => {
  const { user }                                        = useAuth();
  const [sidebarOpen, setSidebarOpen]                   = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab]                       = useState('queue');
  const [selectedGroup, setSelectedGroup]               = useState(null);
  const [queue, setQueue]                               = useState([]);
  const [renewals, setRenewals]                         = useState([]);
  const [loading, setLoading]                           = useState(true);
  const [renewalLoading, setRenewalLoading]             = useState(true);

  const token = localStorage.getItem('token');
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/prescriptions/queue', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setQueue(data);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRenewals = async () => {
    try {
      setRenewalLoading(true);
      const res = await fetch('http://127.0.0.1:8000/renewals/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setRenewals(data);
    } catch (err) {
      console.error('Error fetching renewals:', err);
    } finally {
      setRenewalLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchQueue(); fetchRenewals(); }, []);

  // ── Submit dosage for a single drug in the group ──
  const handleDosageSubmit = async (dosageData) => {
    try {
      // Submit dosage for each drug in the group
      const promises = dosageData.dosages.map((dosage, i) => {
        const drug = selectedGroup.drugs[i];
        return fetch(`http://127.0.0.1:8000/prescriptions/${drug.id}/dosage`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ dosages: [dosage] }),
        });
      });

      await Promise.all(promises);
      setSelectedGroup(null);
      fetchQueue();
      alert(`Schedule generated for ${dosageData.patientName}. Patient will receive reminders.`);
    } catch (err) {
      alert('Could not connect to server. Please try again.');
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/renewals/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) setRenewals(renewals.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error('Error approving renewal:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/renewals/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) setRenewals(renewals.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error('Error rejecting renewal:', err);
    }
  };

  const groupedQueue  = groupQueue(queue);
  const pendingCount  = groupedQueue.filter(g => g.status === 'pending').length;
  const renewalCount  = renewals.filter(r => r.status === 'pending').length;

  // Show dosage form if group selected
  if (selectedGroup) {
    return (
      <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>
        <AddDosageDetails
          prescription={{
            ...selectedGroup,
            drugs: selectedGroup.drugs.map(d => d.medicationName),
          }}
          pharmacistName={user?.name}
          onSubmit={handleDosageSubmit}
          onCancel={() => setSelectedGroup(null)}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={() => setSidebarOpen(false)}>

      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>
          Welcome, {user?.name} 💊
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{today}</p>
      </div>

      <MissedDoseAlert />

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending Prescriptions', value: pendingCount, color: '#fd7e14' },
          { label: 'Processed',  value: groupedQueue.filter(g => g.status !== 'pending').length, color: '#198754' },
          { label: 'Renewal Requests', value: renewalCount, color: '#6f42c1' },
          { label: 'Total Queue', value: groupedQueue.length, color: '#C9A84C' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card-custom text-center" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #e9ecef' }}>
        {[
          { key: 'queue',    label: `📋 Prescription Queue (${pendingCount} pending)` },
          { key: 'renewals', label: `🔄 Renewal Requests (${renewalCount} pending)` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === tab.key ? '2px solid #6f42c1' : '2px solid transparent',
            marginBottom: '-2px', padding: '0.5rem 1rem',
            fontWeight: activeTab === tab.key ? 700 : 500,
            color: activeTab === tab.key ? '#6f42c1' : 'var(--muted)',
            cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Prescription Queue Tab */}
      {activeTab === 'queue' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>📋 Prescription Queue</h5>
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary)' }} />
            </div>
          ) : groupedQueue.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              No pending prescriptions.
            </p>
          ) : (
            groupedQueue.map(group => (
              <div key={group.key} style={{
                padding: '1rem', marginBottom: '0.75rem', borderRadius: '8px',
                border: `1px solid ${group.status === 'pending' ? '#ffc107' : '#b7ebc8'}`,
                backgroundColor: group.status === 'pending' ? '#fffdf0' : '#f0fff4',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{group.patientName}</span>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: group.status === 'pending' ? '#fff3cd' : '#d1e7dd',
                        color: group.status === 'pending' ? '#856404' : '#0f5132',
                        textTransform: 'capitalize',
                      }}>{group.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                      📅 {group.date}
                    </div>
                    <div style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      🩺 <strong>Diagnosis:</strong> {group.diagnosis}
                    </div>
                    {/* All drugs listed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {group.drugs.map((drug, i) => (
                        <div key={drug.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          fontSize: '0.82rem',
                        }}>
                          <span style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            backgroundColor: drug.status === 'pending' ? '#fff3cd' : '#d1e7dd',
                            color: drug.status === 'pending' ? '#856404' : '#0f5132',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                          }}>{i + 1}</span>
                          <span>💊 {drug.medicationName}</span>
                          {drug.status !== 'pending' && (
                            <span style={{ fontSize: '0.72rem', color: '#198754', fontWeight: 600 }}>✅</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {group.status === 'pending' ? (
                    <button
                      onClick={() => setSelectedGroup(group)}
                      style={{
                        backgroundColor: '#6f42c1', color: '#fff', border: 'none',
                        borderRadius: '6px', padding: '0.4rem 1rem',
                        fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap',
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
      )}

      {/* Renewals Tab */}
      {activeTab === 'renewals' && (
        <div className="card-custom">
          <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🔄 Renewal Requests</h5>
          {renewalLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary)' }} />
            </div>
          ) : renewals.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              No renewal requests at this time.
            </p>
          ) : (
            renewals.map(r => (
              <div key={r.id} style={{
                padding: '1rem', marginBottom: '0.75rem', borderRadius: '8px',
                border: `1px solid ${r.status === 'approved' ? '#b7ebc8' : r.status === 'rejected' ? '#f5c2c7' : '#dee2e6'}`,
                backgroundColor: r.status === 'approved' ? '#f0fff4' : r.status === 'rejected' ? '#fff5f5' : '#ffffff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>{r.patientName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                      ID: {r.patientId} · Requested: {new Date(r.requestDate).toLocaleDateString('en-GB')}
                    </div>
                    <div style={{ fontSize: '0.82rem', marginBottom: r.note ? '0.2rem' : 0 }}>
                      💊 <strong>Drug:</strong> {r.drug}
                    </div>
                    {r.note && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic' }}>📝 "{r.note}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {r.status === 'pending' ? (
                      <>
                        <button onClick={() => handleApprove(r.id)} style={{ backgroundColor: '#198754', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.85rem', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>✅ Approve</button>
                        <button onClick={() => handleReject(r.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.85rem', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>❌ Reject</button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: r.status === 'approved' ? '#198754' : '#dc3545', textTransform: 'capitalize' }}>
                        {r.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default PharmacistDashboard;