import React, { useState } from 'react';


const commonDrugs = [
  // ── Analgesics / Antipyretics
  'Paracetamol 500mg',
  'Paracetamol 1000mg',
  'Ibuprofen 200mg',
  'Ibuprofen 400mg',
  'Aspirin 75mg',
  'Aspirin 300mg',
  'Diclofenac 50mg',
  'Tramadol 50mg',

  // ── Antibiotics
  'Amoxicillin 250mg',
  'Amoxicillin 500mg',
  'Amoxicillin/Clavulanate 625mg',
  'Ampicillin 250mg',
  'Ampicillin 500mg',
  'Azithromycin 250mg',
  'Azithromycin 500mg',
  'Ciprofloxacin 250mg',
  'Ciprofloxacin 500mg',
  'Doxycycline 100mg',
  'Erythromycin 250mg',
  'Erythromycin 500mg',
  'Metronidazole 200mg',
  'Metronidazole 400mg',
  'Metronidazole 500mg',
  'Cloxacillin 250mg',
  'Cloxacillin 500mg',
  'Tetracycline 250mg',
  'Trimethoprim/Sulfamethoxazole 480mg',

  // ── Antimalarials
  'Coartem (Artemether/Lumefantrine)',
  'Artesunate 50mg',
  'Artesunate 200mg',
  'Chloroquine 150mg',
  'Quinine 300mg',
  'Fansidar (Sulfadoxine/Pyrimethamine)',

  // ── Antifungals
  'Fluconazole 150mg',
  'Fluconazole 200mg',
  'Ketoconazole 200mg',
  'Clotrimazole Cream',
  'Nystatin Oral Drops',

  // ── Antivirals
  'Acyclovir 200mg',
  'Acyclovir 400mg',

  // ── Antiparasitics
  'Albendazole 400mg',
  'Mebendazole 100mg',
  'Mebendazole 500mg',
  'Ivermectin 6mg',
  'Praziquantel 600mg',

  // ── Gastrointestinal
  'Omeprazole 20mg',
  'Omeprazole 40mg',
  'Ranitidine 150mg',
  'Metoclopramide 10mg',
  'Domperidone 10mg',
  'Loperamide 2mg',
  'Oral Rehydration Salt (ORS)',
  'Zinc Sulfate 20mg',
  'Bisacodyl 5mg',
  'Lactulose Solution',
  'Antacid Suspension',

  // ── Respiratory
  'Salbutamol 2mg',
  'Salbutamol 4mg',
  'Salbutamol Inhaler 100mcg',
  'Prednisolone 5mg',
  'Prednisolone 10mg',
  'Dexamethasone 0.5mg',
  'Dexamethasone 4mg',
  'Theophylline 100mg',
  'Theophylline 200mg',
  'Bromhexine 8mg',
  'Cetirizine 10mg',
  'Loratadine 10mg',
  'Chlorpheniramine 4mg',
  'Promethazine 25mg',

  // ── Cardiovascular
  'Amlodipine 5mg',
  'Amlodipine 10mg',
  'Lisinopril 5mg',
  'Lisinopril 10mg',
  'Atenolol 50mg',
  'Atenolol 100mg',
  'Hydrochlorothiazide 25mg',
  'Methyldopa 250mg',
  'Nifedipine 10mg',
  'Nifedipine 20mg',

  // ── Diabetes
  'Metformin 500mg',
  'Metformin 850mg',
  'Glibenclamide 5mg',
  'Glimepiride 2mg',

  // ── Vitamins & Supplements
  'Vitamin C 500mg',
  'Vitamin C 1000mg',
  'Vitamin B Complex',
  'Vitamin B12 1000mcg',
  'Folic Acid 400mcg',
  'Folic Acid 5mg',
  'Ferrous Sulfate 200mg',
  'Ferrous Gluconate 300mg',
  'Calcium Carbonate 500mg',
  'Zinc Sulfate 20mg',
  'Multivitamin Tablet',

  // ── Eye / Ear / Nose
  'Chloramphenicol Eye Drops',
  'Gentamicin Eye Drops',
  'Tetracycline Eye Ointment',
  'Otosporin Ear Drops',
  'Normal Saline Nasal Drops',
  'Xylometazoline Nasal Spray',

  // ── Skin
  'Hydrocortisone Cream 1%',
  'Betamethasone Cream',
  'Calamine Lotion',
  'Benzyl Benzoate Lotion',
  'Permethrin Cream 5%',
  'Gentian Violet Solution',

  // ── Mental Health
  'Diazepam 2mg',
  'Diazepam 5mg',
  'Haloperidol 5mg',
  'Amitriptyline 25mg',
  'Fluoxetine 20mg',

  // ── Reproductive Health
  'Misoprostol 200mcg',
  'Oxytocin Injection',
  'Combined Oral Contraceptive',
  'Progesterone Only Pill',
  'Emergency Contraception',
];

const NewPrescription = ({ patient, doctorName, onSubmit, onCancel }) => {
  const [diagnosis, setDiagnosis]       = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [notes, setNotes]               = useState('');
  const [error, setError]               = useState('');
  const [drugSearch, setDrugSearch] = useState('');
  const [customDrug, setCustomDrug]       = useState('');
  const [customDrugError, setCustomDrugError] = useState('');
  const [suggestToAdmin, setSuggestToAdmin]   = useState(false);
  const [customDrugs, setCustomDrugs]     = useState([]);

  const toggleDrug = (drug) => {
    setSelectedDrugs(prev =>
      prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
    );
    setError('');
  };
  
  const handleAddCustomDrug = () => {
    const trimmed = customDrug.trim();
    if (!trimmed) {
      setCustomDrugError('Please enter a drug name.');
      return;
    }
    if (selectedDrugs.includes(trimmed) || customDrugs.includes(trimmed)) {
      setCustomDrugError('This drug is already added.');
      return;
    }
    setCustomDrugs([...customDrugs, trimmed]);
    setSelectedDrugs([...selectedDrugs, trimmed]);
    setCustomDrug('');
    setCustomDrugError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Please enter a diagnosis.');
      return;
    }
    if (selectedDrugs.length === 0) {
      setError('Please select at least one drug.');
      return;
    }
  
    onSubmit({
      patientId:      patient.id,
      patientName:    patient.name,
      doctorName,
      diagnosis,
      drugs:          selectedDrugs,
      notes,
      customDrugs:    customDrugs,
      suggestToAdmin: suggestToAdmin && customDrugs.length > 0,
      date:           new Date().toISOString(),
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
            ✏️ New Prescription
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0 }}>
            Writing for: <strong>{patient.name}</strong> ({patient.id})
          </p>
        </div>
      </div>

      <div className="row g-3">
        {/* Left — Form */}
        <div className="col-12 col-lg-7">
          <div className="card-custom">
            <form onSubmit={handleSubmit} noValidate>

              {/* Patient Info (read-only) */}
              <div
                className="mb-4 p-3"
                style={{
                  backgroundColor: '#f0fff4',
                  borderRadius: '8px',
                  border: '1px solid #b7ebc8',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>
                  Patient Information
                </div>
                <div style={{ color: 'var(--muted)' }}>
                  <span>👤 {patient.name}</span>&nbsp;·&nbsp;
                  <span>{patient.gender}</span>&nbsp;·&nbsp;
                  <span style={{ textTransform: 'capitalize' }}>{patient.patientType}</span>
                  {patient.department && <span> · {patient.department}</span>}
                </div>
              </div>

              {/* Doctor (read-only) */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                  Doctor
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={doctorName}
                  readOnly
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>

              {/* Diagnosis */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                  Diagnosis <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="e.g. Malaria, Upper Respiratory Tract Infection"
                  value={diagnosis}
                  onChange={(e) => {
                    setDiagnosis(e.target.value);
                    setError('');
                  }}
                />
              </div>

              {/* Drug Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                    Prescribed Drugs <span style={{ color: '#dc3545' }}>*</span>
                  </label>

                  {/* Drug search filter */}
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Filter drugs by name..."
                    value={drugSearch}
                    onChange={e => setDrugSearch(e.target.value)}
                  />

                  <div style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                  }}>
                    {commonDrugs
                      .filter(drug => drug.toLowerCase().includes(drugSearch.toLowerCase()))
                      .map(drug => (
                        <button
                          key={drug}
                          type="button"
                          onClick={() => toggleDrug(drug)}
                          style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: '1px solid',
                            transition: 'all 0.15s',
                            backgroundColor: selectedDrugs.includes(drug) ? '#198754' : '#fff',
                            color:           selectedDrugs.includes(drug) ? '#fff'    : '#495057',
                            borderColor:     selectedDrugs.includes(drug) ? '#198754' : '#dee2e6',
                            whiteSpace:      'nowrap',
                          }}
                        >
                          {selectedDrugs.includes(drug) ? '✓ ' : ''}{drug}
                        </button>
                      ))
                    }
                  </div>

                  {selectedDrugs.length > 0 && (
                    <small style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.4rem', display: 'block' }}>
                      ✅ Selected ({selectedDrugs.length}): {selectedDrugs.join(', ')}
                    </small>
                  )}
                </div>

              {/* ── Custom Drug Input ── */}
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.85rem',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px dashed #dee2e6',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', color: '#495057' }}>
                  💊 Drug not on the list? Add it manually:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Artemether 80mg"
                    value={customDrug}
                    onChange={e => {
                      setCustomDrug(e.target.value);
                      setCustomDrugError('');
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomDrug();
                      }
                    }}
                    style={{ flex: 1, minWidth: '160px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDrug}
                    style={{
                      backgroundColor: '#0d6efd',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.3rem 0.85rem',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ➕ Add Drug
                  </button>
                </div>

                {customDrugError && (
                  <div style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    {customDrugError}
                  </div>
                )}

                {/* Suggest to admin checkbox */}
                {customDrugs.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="suggestToAdmin"
                      checked={suggestToAdmin}
                      onChange={e => setSuggestToAdmin(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="suggestToAdmin" style={{ cursor: 'pointer', marginBottom: 0 }}>
                      Suggest these custom drugs to Admin for permanent addition
                    </label>
                  </div>
                )}

                {/* Custom drugs added */}
                {customDrugs.length > 0 && (
                  <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {customDrugs.map(drug => (
                      <span
                        key={drug}
                        style={{
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          border: '1px solid #ffc107',
                          borderRadius: '999px',
                          padding: '0.2rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        🆕 {drug}
                        <span
                          onClick={() => {
                            setCustomDrugs(customDrugs.filter(d => d !== drug));
                            setSelectedDrugs(selectedDrugs.filter(d => d !== drug));
                          }}
                          style={{ cursor: 'pointer', fontWeight: 700, marginLeft: '0.2rem' }}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>  
              {/* Notes */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.88rem' }}>
                  Additional Notes <span style={{ color: 'var(--muted)' }}>(optional)</span>
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="Any special instructions for the pharmacist..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

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
                    backgroundColor: '#198754',
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
                  Send to Pharmacy →
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
        </div>

        {/* Right — Live Preview */}
        <div className="col-12 col-lg-5">
          <div className="card-custom" style={{ position: 'sticky', top: '80px' }}>
            <h6 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--muted)' }}>
              📄 PRESCRIPTION PREVIEW
            </h6>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.8 }}>
              <div><strong>Patient:</strong> {patient.name}</div>
              <div><strong>ID:</strong> {patient.id}</div>
              <div><strong>Doctor:</strong> {doctorName}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</div>
              <hr />
              <div>
                <strong>Diagnosis:</strong>{' '}
                {diagnosis || <span style={{ color: 'var(--muted)' }}>Not entered yet</span>}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Drugs:</strong>
                {selectedDrugs.length === 0 ? (
                  <span style={{ color: 'var(--muted)' }}> None selected</span>
                ) : (
                  <ul style={{ margin: '0.3rem 0 0 1rem', padding: 0 }}>
                    {selectedDrugs.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                )}
              </div>
              {notes && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Notes:</strong> {notes}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewPrescription;