import React, { useState, useEffect } from 'react';
import { pharmaciesAPI } from '../../services/api';
import { MdAddCircle, MdEdit, MdDelete, MdClose, MdLocalPharmacy } from 'react-icons/md';

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar','Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla','Monaragala','Ratnapura','Kegalle'];
const PROVINCES = ['Western','Central','Southern','Northern','Eastern','North Western','North Central','Uva','Sabaragamuwa'];
const EMPTY = { name: '', registrationNo: '', district: 'Colombo', province: 'Western', address: '', phone: '', email: '', isActive: true };

export default function Pharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPharmacies(); }, []);

  const fetchPharmacies = async () => {
    setLoading(true);
    const res = await pharmaciesAPI.getAll();
    setPharmacies(res.data.data);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => { setEditing(p._id); setForm({...p}); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await pharmaciesAPI.update(editing, form);
      else await pharmaciesAPI.create(form);
      setShowModal(false);
      fetchPharmacies();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this pharmacy?')) return;
    await pharmaciesAPI.delete(id);
    fetchPharmacies();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Pharmacy Management</h1>
          <p className="text-slate-500 text-sm">{pharmacies.length} pharmacies registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><MdAddCircle className="text-xl" /> Register Pharmacy</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">Pharmacy</th>
                <th className="table-header">Reg. No</th>
                <th className="table-header">District</th>
                <th className="table-header">Province</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="table-cell"><div className="h-4 bg-slate-700/50 rounded animate-pulse"></div></td>)}</tr>
                ))
              ) : pharmacies.map(p => (
                <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{p.address}</p>
                  </td>
                  <td className="table-cell font-mono text-xs text-slate-400">{p.registrationNo}</td>
                  <td className="table-cell"><span className="badge-blue">{p.district}</span></td>
                  <td className="table-cell text-xs text-slate-400">{p.province}</td>
                  <td className="table-cell text-xs">
                    <p className="text-slate-300">{p.phone}</p>
                    <p className="text-slate-500">{p.email}</p>
                  </td>
                  <td className="table-cell">
                    {p.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-indigo-400 p-1"><MdEdit /></button>
                      <button onClick={() => handleDelete(p._id)} className="text-slate-400 hover:text-red-400 p-1"><MdDelete /></button>
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
                <MdLocalPharmacy className="text-cyan-400" />{editing ? 'Edit Pharmacy' : 'Register Pharmacy'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1"><MdClose /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-text">Pharmacy Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Registration No. *</label>
                  <input value={form.registrationNo} onChange={e => setForm({...form, registrationNo: e.target.value})} className="input-field font-mono" />
                </div>
                <div>
                  <label className="label-text">District</label>
                  <select value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="input-field">
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Province</label>
                  <select value={form.province} onChange={e => setForm({...form, province: e.target.value})} className="input-field">
                    {PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Phone *</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Address *</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                  <label htmlFor="active" className="text-sm text-slate-300">Active Status</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Saving...' : editing ? 'Update' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
