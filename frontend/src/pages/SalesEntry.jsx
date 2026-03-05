import React, { useState, useEffect } from 'react';
import { salesAPI, medicinesAPI, pharmaciesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdAddCircle, MdMedication, MdCheckCircle } from 'react-icons/md';

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Batticaloa','Ampara','Trincomalee','Kurunegala',
  'Puttalam','Anuradhapura','Polonnaruwa','Badulla','Monaragala',
  'Ratnapura','Kegalle'
];

export default function SalesEntry() {
  const { user, isAdmin } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    medicine: '', pharmacy: '', quantity: 1, unitPrice: '',
    saleDate: new Date().toISOString().substring(0, 10),
    prescriptionProvided: false, patientAge: '', patientGender: 'Not Specified',
    batchNo: '', notes: ''
  });

  useEffect(() => {
    const fetchInit = async () => {
      const [medRes, pharmRes] = await Promise.all([
        medicinesAPI.getAll({ limit: 200 }),
        isAdmin() ? pharmaciesAPI.getAll() : Promise.resolve({ data: { data: [] } })
      ]);
      setMedicines(medRes.data.data);
      setPharmacies(pharmRes.data.data);
      // Auto-set pharmacy for pharmacy role
      if (user?.pharmacy) setForm(f => ({ ...f, pharmacy: user.pharmacy._id || user.pharmacy }));
    };
    fetchInit();
  }, []);

  const handleMedicineChange = (e) => {
    const med = medicines.find(m => m._id === e.target.value);
    setForm(f => ({
      ...f,
      medicine: e.target.value,
      unitPrice: med?.price || '',
      prescriptionRequired: med?.type === 'Prescription (Rx)'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await salesAPI.create(form);
      setSuccess(true);
      setForm(f => ({ ...f, medicine: '', quantity: 1, unitPrice: '', batchNo: '', notes: '', patientAge: '' }));
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const total = (form.quantity || 0) * (form.unitPrice || 0);
  const selectedMed = medicines.find(m => m._id === form.medicine);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Record Medicine Sale</h1>
        <p className="text-slate-500 text-sm mt-0.5">Log a new pharmacy dispensing record</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-slide-up">
          <MdCheckCircle className="text-emerald-400 text-2xl" />
          <div>
            <p className="text-emerald-400 font-medium">Sale Recorded Successfully!</p>
            <p className="text-emerald-300/70 text-sm">The dispensing record has been saved.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">⚠ {error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Medicine & Pharmacy */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-slate-300 flex items-center gap-2">
            <MdMedication className="text-indigo-400" /> Medicine Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Medicine *</label>
              <select value={form.medicine} onChange={handleMedicineChange} className="input-field" required>
                <option value="">Select medicine...</option>
                {medicines.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.type?.includes('OTC') ? 'OTC' : 'Rx'})</option>
                ))}
              </select>
            </div>

            {isAdmin() ? (
              <div>
                <label className="label-text">Pharmacy *</label>
                <select value={form.pharmacy} onChange={e => setForm({...form, pharmacy: e.target.value})} className="input-field" required>
                  <option value="">Select pharmacy...</option>
                  {pharmacies.map(p => (
                    <option key={p._id} value={p._id}>{p.name} – {p.district}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="label-text">Pharmacy</label>
                <input type="text" value={user?.pharmacy?.name || 'Your Pharmacy'} disabled className="input-field opacity-60 cursor-not-allowed" />
              </div>
            )}
          </div>

          {selectedMed && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-sm">
              <p className="text-indigo-400 font-medium">{selectedMed.name}</p>
              <p className="text-slate-400 mt-0.5">
                Category: {selectedMed.category} · Type: {selectedMed.type}
                {selectedMed.diseases?.length > 0 && ` · Diseases: ${selectedMed.diseases.map(d => d.name).join(', ')}`}
              </p>
            </div>
          )}
        </div>

        {/* Sale Details */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-slate-300">Sale Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Quantity *</label>
              <input type="number" min="1" value={form.quantity}
                onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 1})}
                className="input-field" required />
            </div>
            <div>
              <label className="label-text">Unit Price (Rs.) *</label>
              <input type="number" step="0.01" min="0" value={form.unitPrice}
                onChange={e => setForm({...form, unitPrice: parseFloat(e.target.value) || 0})}
                className="input-field" required />
            </div>
            <div>
              <label className="label-text">Total Amount</label>
              <div className="input-field bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold cursor-not-allowed">
                Rs. {total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Sale Date *</label>
              <input type="date" value={form.saleDate}
                onChange={e => setForm({...form, saleDate: e.target.value})}
                className="input-field" required />
            </div>
            <div>
              <label className="label-text">Batch No.</label>
              <input type="text" placeholder="e.g. BT2024-001" value={form.batchNo}
                onChange={e => setForm({...form, batchNo: e.target.value})}
                className="input-field" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
            <input type="checkbox" id="rx" checked={form.prescriptionProvided}
              onChange={e => setForm({...form, prescriptionProvided: e.target.checked})}
              className="w-4 h-4 accent-indigo-600" />
            <label htmlFor="rx" className="text-sm text-slate-300 cursor-pointer">
              Prescription provided by patient
              {selectedMed?.type?.includes('Prescription') && 
                <span className="ml-2 badge-red">Rx Required</span>
              }
            </label>
          </div>
        </div>

        {/* Patient Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-slate-300">Patient Information <span className="text-slate-600 font-normal text-sm">(Optional)</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Patient Age</label>
              <input type="number" min="0" max="120" placeholder="Age in years" value={form.patientAge}
                onChange={e => setForm({...form, patientAge: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="label-text">Patient Gender</label>
              <select value={form.patientGender}
                onChange={e => setForm({...form, patientGender: e.target.value})}
                className="input-field">
                <option>Not Specified</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Notes</label>
            <textarea rows={2} placeholder="Any additional notes..."
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="input-field resize-none" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-3 text-base">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Recording...</>
          ) : (
            <><MdAddCircle className="text-xl" />Record Sale</>
          )}
        </button>
      </form>
    </div>
  );
}
