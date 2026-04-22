import React, { useState } from 'react';

const RenewalQueue = ({ renewalRequests }) => {
  const [renewals, setRenewals] = useState(renewalRequests);

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
    <div className="card-custom">
      <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
        🔄 Renewal Requests
      </h5>

      {renewals.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          No renewal requests at this time.
        </p>
      )}

      {renewals.map((r) => (
        <div
          key={r.id}
          style={{
            padding: '1rem',
            marginBottom: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${
              r.status === 'Approved' ? '#b7ebc8' :
              r.status === 'Rejected' ? '#f5c2c7' : '#dee2e6'
            }`,
            backgroundColor:
              r.status === 'Approved' ? '#f0fff4' :
              r.status === 'Rejected' ? '#fff5f5' : '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {/* Info */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                {r.patientName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                ID: {r.patientId} · Requested: {r.requestDate}
              </div>
              <div style={{ fontSize: '0.82rem' }}>
                💊 <strong>Drug:</strong> {r.drug}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: r.status === 'Approved' ? '#198754' : '#dc3545',
                  }}
                >
                  {r.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RenewalQueue;