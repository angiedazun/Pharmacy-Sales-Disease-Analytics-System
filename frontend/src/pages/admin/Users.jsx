import React, { useState, useEffect } from 'react';
import { usersAPI, pharmaciesAPI } from '../../services/api';
import { MdAddCircle, MdEdit, MdDelete, MdClose, MdPeople, MdShield } from 'react-icons/md';
import { format } from 'date-fns';

const ROLES = ['admin', 'pharmacy', 'analyst'];
const EMPTY = { name: '', email: '', password: '', role: 'pharmacy', pharmacy: '', isActive: true };

const roleColors = {
  admin: 'badge-purple',
  pharmacy: 'badge-blue',
  analyst: 'badge-green'
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [uRes, pRes] = await Promise.all([usersAPI.getAll(), pharmaciesAPI.getAll()]);
    setUsers(uRes.data.data);
    setPharmacies(pRes.data.data);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (u) => { setEditing(u._id); setForm({...u, password: '', pharmacy: u.pharmacy?._id || ''}); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {...form};
      if (!payload.password) delete payload.password;
      if (!payload.pharmacy) payload.pharmacy = null;
      if (editing) await usersAPI.update(editing, payload);
      else await usersAPI.create(payload);
      setShowModal(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    await usersAPI.delete(id);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-slate-500 text-sm">{users.length} users registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><MdAddCircle className="text-xl" /> Add User</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Role</th>
                <th className="table-header">Pharmacy</th>
                <th className="table-header">Status</th>
                <th className="table-header">Last Login</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="table-cell"><div className="h-4 bg-slate-700/50 rounded animate-pulse"></div></td>)}</tr>
                ))
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={roleColors[u.role]}>
                      <MdShield className="inline text-xs mr-1" />{u.role}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-slate-400">{u.pharmacy?.name || '—'}</td>
                  <td className="table-cell">
                    {u.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}
                  </td>
                  <td className="table-cell text-xs text-slate-500">
                    {u.lastLogin ? format(new Date(u.lastLogin), 'MMM dd, yyyy') : 'Never'}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-indigo-400 p-1"><MdEdit /></button>
                      <button onClick={() => handleDelete(u._id)} className="text-slate-400 hover:text-red-400 p-1"><MdDelete /></button>
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
          <div className="glass-card w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MdPeople className="text-indigo-400" />{editing ? 'Edit User' : 'Create User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1"><MdClose /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">Full Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-text">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-text">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-text">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-field">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {form.role === 'pharmacy' && (
                <div>
                  <label className="label-text">Assigned Pharmacy</label>
                  <select value={form.pharmacy} onChange={e => setForm({...form, pharmacy: e.target.value})} className="input-field">
                    <option value="">None</option>
                    {pharmacies.map(p => <option key={p._id} value={p._id}>{p.name} – {p.district}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="uActive" checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                <label htmlFor="uActive" className="text-sm text-slate-300">Account Active</label>
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
