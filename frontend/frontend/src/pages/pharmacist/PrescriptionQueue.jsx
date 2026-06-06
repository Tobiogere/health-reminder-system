import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import useAuth from '../../hooks/useAuth';
import AddDosageDetails from './AddDosageDetails';

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
    if (rx.status === 'pending') groups[key].status = 'pending';
  });
  return Object.values(groups);
};

const PrescriptionQueue = () => {
  const { user }                          = useAuth();
  const [sidebarOpen, setSidebarOpen]     = useState(window.innerWidth > 768);
  const [queue, setQueue]                 = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filterStatus, setFilterStatus]   = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);

  const token = localStorage.getItem('token');

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchQueue(); }, []);

  const handleDosageSubmit = async (dosageData) => {
    try {
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
      alert(`Schedule generated for ${dosageData.patientName}.`);
    } catch (err) {
      alert('Could not connect to server. Please try again.');
    }
  };

  const groupedQueue = groupQueue(queue);

  const filtered = groupedQueue.filter(group => {
    const matchesStatus = filterStatus === 'all' || group.status.toLowerCase() === filterStatus;
    const matchesSearch =
      (group.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.diagnosis   || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.drugs.some(d => (d.medicationName || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = groupedQueue.filter(g => g.status === 'pending').length;
  const activeCount  = groupedQueue.filter(g => g.status !== 'pending').length;

  if (selectedGroup) {
    return (
      <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onCloseSidebar={() => setSidebarOpen(false)}>
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
    <PageWrapper sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onCloseSidebar={() => setSidebarOpen(false)}>

      <div className="mb-4">
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.2rem' }}>📋 Prescription Queue</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>All prescriptions sent from doctors</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Loading queue...</p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {[
              { label: 'Pending',         value: pendingCount, color: '#fd7e14' },
              { label: 'Processed',       value: activeCount,  color: '#198754' },
              { label: 'Total',           value: groupedQueue.length, color: '#C9A84C' },
              { label: 'Completion Rate', value: `${groupedQueue.length > 0 ? Math.round((activeCount / groupedQueue.length) * 100) : 0}%`, color: '#6f42c1' },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="card-custom text-center" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-custom mb-3">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text" className="form-control form-control-sm"
                placeholder="Search patient or diagnosis..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              />
              <select className="form-select form-select-sm" value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)} style={{ width: '140px' }}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Processed</option>
              </select>
            </div>
          </div>

          <div className="card-custom">
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                No prescriptions found.
              </p>
            ) : (
              filtered.map(group => (
                <div key={group.key} style={{
                  padding: '1rem', marginBottom: '0.75rem', borderRadius: '8px',
                  border: `1px solid ${group.status === 'pending' ? '#ffc107' : '#b7ebc8'}`,
                  backgroundColor: group.status === 'pending' ? '#fffdf0' : '#f0fff4',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{group.patientName}</span>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          backgroundColor: group.status === 'pending' ? '#fff3cd' : '#d1e7dd',
                          color: group.status === 'pending' ? '#856404' : '#0f5132',
                          textTransform: 'capitalize',
                        }}>{group.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>📅 {group.date}</div>
                      <div style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                        🩺 <strong>Diagnosis:</strong> {group.diagnosis}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {group.drugs.map((drug, i) => (
                          <div key={drug.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
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
                      <span style={{ fontSize: '0.82rem', color: '#198754', fontWeight: 600 }}>✅ Schedule Generated</span>
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