import React, { useState, useEffect } from 'react';
import { medicinesAPI, diseasesAPI } from '../../services/api';
import { MdAddCircle, MdEdit, MdDelete, MdClose, MdMedication } from 'react-icons/md';

const CATEGORIES = ['Antibiotic','Analgesic','Antipyretic','Antidiabetic','Antihypertensive','Antifungal','Antihistamine','Antiviral','Bronchodilator','Cardiovascular','Dermatological','Gastrointestinal','Hormonal','Neurological','Nutritional Supplement','Ophthalmic','Psychiatric','Vaccine','Vitamins & Minerals','Other'];
const TYPES = ['Prescription (Rx)', 'Over-the-Counter (OTC)', 'Controlled Substance'];
const UNITS = ['Tablet','Capsule','Syrup (ml)','Injection (vial)','Cream/Ointment (g)','Drops','Inhaler','Patch','Powder','Other'];

const EMPTY = { name: '', genericName: '', brand: '', category: 'Other', type: 'Over-the-Counter (OTC)', unit: 'Tablet', price: '', manufacturer: '', diseases: [], description: '' };

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [mRes, dRes] = await Promise.all([
      medicinesAPI.getAll({ limit: 200 }),
      diseasesAPI.getAll()
    ]);
    setMedicines(mRes.data.data);
    setDiseases(dRes.data.data);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (med) => {
    setEditing(med._id);
    setForm({ ...med, diseases: med.diseases?.map(d => d._id || d) || [] });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await medicinesAPI.update(editing, form);
      else await medicinesAPI.create(form);
      setShowModal(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this medicine?')) return;
    await medicinesAPI.delete(id);
    fetchAll();
  };

  const toggleDisease = (id) => {
    setForm(f => ({
      ...f,
      diseases: f.diseases.includes(id) ? f.diseases.filter(d => d !== id) : [...f.diseases, id]
    }));
  };

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Medicine Management</h1>
          <p className="text-slate-500 text-sm">{medicines.length} medicines in database</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <MdAddCircle className="text-xl" /> Add Medicine
        </button>
      </div>

      <div className="glass-card p-4">
        <input placeholder="Search medicines..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field py-2 text-sm" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">Medicine</th>
                <th className="table-header">Category</th>
                <th className="table-header">Type</th>
                <th className="table-header">Price</th>
                <th className="table-header">Linked Diseases</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="table-cell"><div className="h-4 bg-slate-700/50 rounded animate-pulse"></div></td>)}</tr>
                ))
              ) : filtered.map(med => (
                <tr key={med._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-white">{med.name}</p>
                    <p className="text-xs text-slate-500">{med.genericName} · {med.brand}</p>
                  </td>
                  <td className="table-cell"><span className="badge-blue">{med.category}</span></td>
                  <td className="table-cell">
                    <span className={med.type?.includes('OTC') ? 'badge-green' : 'badge-yellow'}>
                      {med.type?.includes('OTC') ? 'OTC' : 'Rx'}
                    </span>
                  </td>
                  <td className="table-cell text-emerald-400 font-medium">Rs. {med.price}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {med.diseases?.slice(0, 2).map(d => <span key={d._id} className="badge-purple">{d.name}</span>)}
                      {med.diseases?.length > 2 && <span className="badge-blue">+{med.diseases.length - 2}</span>}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(med)} className="text-slate-400 hover:text-indigo-400 transition-colors p-1"><MdEdit /></button>
                      <button onClick={() => handleDelete(med._id)} className="text-slate-400 hover:text-red-400 transition-colors p-1"><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MdMedication className="text-indigo-400" />
                {editing ? 'Edit Medicine' : 'Add Medicine'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1"><MdClose /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-text">Medicine Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="label-text">Generic Name</label>
                  <input value={form.genericName} onChange={e => setForm({...form, genericName: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Brand</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input-field">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Price (Rs.)</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Manufacturer</label>
                  <input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="input-field" />
                </div>
              </div>

              {/* Disease mapping */}
              <div>
                <label className="label-text">Linked Diseases</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-700 max-h-40 overflow-y-auto">
                  {diseases.map(d => (
                    <button
                      key={d._id}
                      type="button"
                      onClick={() => toggleDisease(d._id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        form.diseases.includes(d._id)
                          ? 'bg-indigo-600/40 border-indigo-500/60 text-indigo-300'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
