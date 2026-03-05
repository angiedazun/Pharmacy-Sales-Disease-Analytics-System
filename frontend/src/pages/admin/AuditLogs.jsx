import React, { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { MdHistory, MdFilterList, MdRefresh, MdPerson, MdShield } from 'react-icons/md';
import { format } from 'date-fns';

const ACTION_CONFIG = {
  CREATE: { color: 'badge-green', label: 'CREATE' },
  UPDATE: { color: 'badge-blue', label: 'UPDATE' },
  DELETE: { color: 'badge-red', label: 'DELETE' },
  LOGIN:  { color: 'badge-purple', label: 'LOGIN' },
  EXPORT: { color: 'badge-yellow', label: 'EXPORT' },
  VIEW:   { color: 'badge-blue', label: 'VIEW' }
};

const RESOURCES = ['', 'Sale', 'User', 'Medicine', 'Disease', 'Pharmacy'];
const ACTIONS   = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'VIEW'];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ resource: '', action: '' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await auditAPI.getAll(params);
      setLogs(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, filters]);

  const roleColors = {
    admin: 'badge-purple', pharmacy: 'badge-blue', analyst: 'badge-green'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><MdHistory className="text-indigo-400" /> Audit Logs</h1>
          <p className="text-slate-500 text-sm">{total.toLocaleString()} total events recorded</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary py-2"><MdRefresh /> Refresh</button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-end">
        <MdFilterList className="text-slate-500 text-xl mt-2" />
        <div>
          <label className="label-text">Resource</label>
          <select value={filters.resource} onChange={e => { setFilters(f => ({...f, resource: e.target.value})); setPage(1); }}
            className="input-field w-36 py-2 text-sm">
            {RESOURCES.map(r => <option key={r} value={r}>{r || 'All Resources'}</option>)}
          </select>
        </div>
        <div>
          <label className="label-text">Action</label>
          <select value={filters.action} onChange={e => { setFilters(f => ({...f, action: e.target.value})); setPage(1); }}
            className="input-field w-36 py-2 text-sm">
            {ACTIONS.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}
          </select>
        </div>
        <button onClick={() => { setFilters({ resource: '', action: '' }); setPage(1); }}
          className="btn-secondary py-2 text-sm">Clear</button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">Timestamp</th>
                <th className="table-header">User</th>
                <th className="table-header">Action</th>
                <th className="table-header">Resource</th>
                <th className="table-header">Description</th>
                <th className="table-header">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="table-cell"><div className="h-4 bg-slate-700/50 rounded animate-pulse"></div></td>)}</tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="table-cell text-center text-slate-500 py-12">No audit logs found</td></tr>
              ) : logs.map((log, i) => {
                const ac = ACTION_CONFIG[log.action] || { color: 'badge-blue', label: log.action };
                return (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="table-cell">
                      <p className="text-xs font-mono text-slate-300">{log.createdAt ? format(new Date(log.createdAt), 'MMM dd, HH:mm:ss') : '—'}</p>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {log.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{log.userName || 'System'}</p>
                          {log.userRole && <span className={`text-xs ${roleColors[log.userRole] || 'badge-blue'}`}>{log.userRole}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><span className={ac.color}>{ac.label}</span></td>
                    <td className="table-cell"><span className="badge-blue">{log.resource}</span></td>
                    <td className="table-cell text-slate-400 text-sm max-w-xs truncate">{log.description || '—'}</td>
                    <td className="table-cell text-xs font-mono text-slate-500">{log.ipAddress || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary py-1 px-3 text-sm disabled:opacity-40">←</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-secondary py-1 px-3 text-sm disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
