import React, { useState } from 'react';

const frequencyOptions = [
  { label: 'Once daily',        value: 1, times: ['08:00'] },
  { label: 'Twice daily',       value: 2, times: ['08:00', '20:00'] },
  { label: 'Three times daily', value: 3, times: ['08:00', '14:00', '20:00'] },
  { label: 'Four times daily',  value: 4, times: ['08:00', '12:00', '16:00', '22:00'] },
  { label: 'Every 8 hours',     value: 3, times: ['08:00', '16:00', '00:00'] },
];

const durationOptions = [3, 5, 7, 10, 14, 21, 30];

const AddDosageDetails = ({ prescription, pharmacistName, onSubmit, onCancel }) => {
  const initialDosages = prescription.drugs.map((drug) => ({
    drug,
    dosage:    '',
    frequency: '',
    duration:  '',
    times:     [],
  }));

  const [dosages, setDosages] = useState(initialDosages);
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateDosage = (index, field, value) => {
    const updated = [...dosages];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'frequency') {
      const found = frequencyOptions.find(f => f.label === value);
      updated[index].times         = found ? [...found.times] : [];
      updated[index].frequencyValue = found ? found.value : 1;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    // Format dosages for backend
    const formattedDosages = dosages.map(d => ({
      dosage:    d.dosage,
      frequency: d.frequencyValue || 1,
      duration:  parseInt(d.duration),
      times:     d.times,
    }));

    await onSubmit({
      prescriptionId: prescription.id,
      patientName:    prescription.patientName,
      patientId:      prescription.patientId,
      pharmacistName,
      dosages:        formattedDosages,
      processedAt:    new Date().toISOString(),
    });

    setSubmitting(false);
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
            👤 {prescription.patientName} &nbsp;·&nbsp;
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
                  Duration (days) <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  className="form-select form-select-sm"
                  value={item.duration}
                  onChange={(e) => updateDosage(index, 'duration', e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {durationOptions.map(d => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>

              {/* Auto-filled times */}
              {item.times.length > 0 && (
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                    Reminder Times
                    <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.4rem' }}>
                      (auto-filled in 24hr format, adjust if needed)
                    </span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.times.map((time, ti) => (
                      <input
                        key={ti}
                        type="time"
                        className="form-control form-control-sm"
                        value={time}
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
            disabled={submitting}
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
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Generating...' : '✅ Generate Schedule & Notify Patient'}
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