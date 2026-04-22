import React, { useState } from 'react';

const frequencyOptions = [
  { label: 'Once daily',       times: ['08:00 AM'] },
  { label: 'Twice daily',      times: ['08:00 AM', '08:00 PM'] },
  { label: 'Three times daily',times: ['08:00 AM', '02:00 PM', '08:00 PM'] },
  { label: 'Four times daily', times: ['08:00 AM', '12:00 PM', '04:00 PM', '10:00 PM'] },
  { label: 'Every 8 hours',    times: ['08:00 AM', '04:00 PM', '12:00 AM'] },
];

const durationOptions = [
  '3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days',
];

const AddDosageDetails = ({ prescription, pharmacistName, onSubmit, onCancel }) => {
  // One dosage entry per drug
  const initialDosages = prescription.drugs.map((drug) => ({
    drug,
    dosage:    '',
    frequency: '',
    duration:  '',
    times:     [],
  }));

  const [dosages, setDosages] = useState(initialDosages);
  const [error, setError]     = useState('');

  const updateDosage = (index, field, value) => {
    const updated = [...dosages];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-fill times when frequency is selected
    if (field === 'frequency') {
      const found = frequencyOptions.find(f => f.label === value);
      updated[index].times = found ? [...found.times] : [];
    }

    setDosages(updated);
    setError('');
  };

  const updateTime = (drugIndex, timeIndex, value) => {
    const updated = [...dosages];
    updated[drugIndex].times[timeIndex] = value;
    setDosages(updated);
  };

  const validate = () => {
    for (const d of dosages) {
      if (!d.dosage)    return `Please enter dosage for ${d.drug}`;
      if (!d.frequency) return `Please select frequency for ${d.drug}`;
      if (!d.duration)  return `Please select duration for ${d.drug}`;
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit({
      prescriptionId: prescription.id,
      patientName:    prescription.patientName,
      patientId:      prescription.patientId,
      pharmacistName,
      dosages,
      processedAt: new Date().toISOString(),
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '0.3rem 0.7rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
            ➕ Add Dosage Details
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0 }}>
            For: <strong>{prescription.patientName}</strong> · {prescription.diagnosis}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* Prescription summary */}
        <div
          className="mb-4 p-3"
          style={{
            backgroundColor: '#f0f0ff',
            borderRadius: '8px',
            border: '1px solid #c5c8ff',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>
            Prescription Summary
          </div>
          <div style={{ color: 'var(--muted)' }}>
            👤 {prescription.patientName} ({prescription.patientId}) &nbsp;·&nbsp;
            👨‍⚕️ {prescription.doctor} &nbsp;·&nbsp;
            🩺 {prescription.diagnosis}
          </div>
        </div>

        {/* One card per drug */}
        {dosages.map((item, index) => (
          <div
            key={item.drug}
            className="card-custom mb-3"
            style={{ borderLeft: '4px solid #6f42c1' }}
          >
            <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: '#6f42c1' }}>
              💊 {item.drug}
            </h6>

            <div className="row g-3">

              {/* Dosage */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Dosage <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. 1 tablet, 2 capsules"
                  value={item.dosage}
                  onChange={(e) => updateDosage(index, 'dosage', e.target.value)}
                />
              </div>

              {/* Frequency */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Frequency <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  className="form-select form-select-sm"
                  value={item.frequency}
                  onChange={(e) => updateDosage(index, 'frequency', e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {frequencyOptions.map(f => (
                    <option key={f.label} value={f.label}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Duration <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  className="form-select form-select-sm"
                  value={item.duration}
                  onChange={(e) => updateDosage(index, 'duration', e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {durationOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Auto-filled times */}
              {item.times.length > 0 && (
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                    Reminder Times
                    <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.4rem' }}>
                      (auto-filled, adjust if needed)
                    </span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.times.map((time, ti) => (
                      <input
                        key={ti}
                        type="time"
                        className="form-control form-control-sm"
                        value={
                          // convert "08:00 AM" to 24hr for input
                          time.includes('AM') || time.includes('PM')
                            ? (() => {
                                const [t, meridiem] = time.split(' ');
                                let [h, m] = t.split(':').map(Number);
                                if (meridiem === 'PM' && h !== 12) h += 12;
                                if (meridiem === 'AM' && h === 12) h = 0;
                                return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                              })()
                            : time
                        }
                        onChange={(e) => updateTime(index, ti, e.target.value)}
                        style={{ maxWidth: '130px' }}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}

        {/* Error */}
        {error && (
          <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#6f42c1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            ✅ Generate Schedule & Notify Patient
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: '#f8f9fa',
              color: '#495057',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddDosageDetails;