import React, { useState, useEffect } from 'react';
import { diseasesAPI } from '../../services/api';
import { MdAddCircle, MdEdit, MdDelete, MdClose, MdCoronavirus } from 'react-icons/md';

const CATS = ['Infectious Disease','Chronic Disease','Respiratory Disease','Cardiovascular Disease','Neurological Disorder','Metabolic Disease','Gastrointestinal Disease','Mental Health','Skin Disease','Musculoskeletal','Endocrine Disorder','Other'];
const SEVS = ['Low', 'Medium', 'High', 'Critical'];
const EMPTY = { name: '', code: '', category: 'Other', severity: 'Medium', description: '', isNotifiable: false, symptoms: [] };

const SEV_COLORS = { Low: 'badge-green', Medium: 'badge-yellow', High: 'badge-red', Critical: 'badge-red' };

export default function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');

  useEffect(() => { fetchDiseases(); }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    const res = await diseasesAPI.getAll();
    setDiseases(res.data.data);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (d) => { setEditing(d._id); setForm({...d}); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await diseasesAPI.update(editing, form);
      else await diseasesAPI.create(form);
      setShowModal(false);
      fetchDiseases();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this disease?')) return;
    await diseasesAPI.delete(id);
    fetchDiseases();
  };

  const addSymptom = () => {
    if (!symptomInput.trim()) return;
    setForm(f => ({ ...f, symptoms: [...(f.symptoms || []), symptomInput.trim()] }));
    setSymptomInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Disease Management</h1>
          <p className="text-slate-500 text-sm">{diseases.length} diseases in database</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><MdAddCircle className="text-xl" /> Add Disease</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">Disease</th>
                <th className="table-header">Code</th>
                <th className="table-header">Category</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Notifiable</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="table-cell"><div className="h-4 bg-slate-700/50 rounded animate-pulse"></div></td>)}</tr>
                ))
              ) : diseases.map(d => (
                <tr key={d._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-white">{d.name}</p>
                    <p className="text-xs text-slate-500">{d.symptoms?.slice(0,2).join(', ')}</p>
                  </td>
                  <td className="table-cell text-xs font-mono text-slate-400">{d.code}</td>
                  <td className="table-cell"><span className="badge-blue">{d.category}</span></td>
                  <td className="table-cell"><span className={SEV_COLORS[d.severity]}>{d.severity}</span></td>
                  <td className="table-cell">
                    {d.isNotifiable ? <span className="badge-red">⚑ Notifiable</span> : <span className="badge-green">Standard</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="text-slate-400 hover:text-indigo-400 p-1"><MdEdit /></button>
                      <button onClick={() => handleDelete(d._id)} className="text-slate-400 hover:text-red-400 p-1"><MdDelete /></button>
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
          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MdCoronavirus className="text-red-400" />{editing ? 'Edit Disease' : 'Add Disease'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1"><MdClose /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-text">Disease Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Code (ICD)</label>
                  <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="input-field font-mono" />
                </div>
                <div>
                  <label className="label-text">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Severity</label>
                  <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="input-field">
                    {SEVS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="notifiable" checked={form.isNotifiable}
                    onChange={e => setForm({...form, isNotifiable: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                  <label htmlFor="notifiable" className="text-sm text-slate-300">Notifiable Disease</label>
                </div>
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" />
              </div>
              <div>
                <label className="label-text">Symptoms</label>
                <div className="flex gap-2 mb-2">
                  <input value={symptomInput} onChange={e => setSymptomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                    placeholder="Add symptom..." className="input-field flex-1 py-2 text-sm" />
                  <button type="button" onClick={addSymptom} className="btn-primary py-2 px-3 text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.symptoms || []).map((s, i) => (
                    <span key={i} className="badge-blue flex items-center gap-1">
                      {s}
                      <button onClick={() => setForm(f => ({...f, symptoms: f.symptoms.filter((_, j) => j !== i)}))}
                        className="hover:text-red-400 ml-1">×</button>
                    </span>
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
