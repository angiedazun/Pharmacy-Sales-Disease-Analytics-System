import React, { useState, useEffect } from 'react';
import { salesAPI, pharmaciesAPI, exportSalesCSV } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdHistory, MdFilterList, MdDeleteOutline, MdRefresh, MdDownload } from 'react-icons/md';
import { format } from 'date-fns';

const DISTRICTS = [
  '','Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kurunegala','Puttalam',
  'Anuradhapura','Polonnaruwa','Badulla','Monaragala','Ratnapura',
  'Kegalle','Batticaloa','Ampara','Trincomalee','Kilinochchi','Mannar','Vavuniya'
];

export default function SalesHistory() {
  const { isAdmin, user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ district: '', startDate: '', endDate: '' });
  const [medicineSearch, setMedicineSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await salesAPI.getAll(params);
      setSales(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, [page, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale record?')) return;
    try {
      await salesAPI.delete(id);
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportSalesCSV({
        ...(filters.district && { district: filters.district }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });
    } catch (err) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const displayedSales = medicineSearch
    ? sales.filter(s => s.medicine?.name?.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        s.medicine?.genericName?.toLowerCase().includes(medicineSearch.toLowerCase()))
    : sales;

  const rxBadge = (provided, required) => {
    if (!required) return <span className="badge-green">OTC</span>;
    return provided ? <span className="badge-green">Rx ✓</span> : <span className="badge-red">Rx Missing</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Sales History</h1>
          {user?.role === 'pharmacy' && user?.pharmacy?.name ? (
            <p className="text-slate-400 text-sm mt-0.5">
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full text-xs font-medium">
                🏥 {user.pharmacy.name} — {user.pharmacy.district || 'District'} · Your pharmacy only
              </span>
            </p>
          ) : (
            <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} total records</p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} disabled={exporting} className="btn-secondary py-2">
            <MdDownload className={exporting ? 'animate-bounce' : ''} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button onClick={fetchSales} className="btn-secondary py-2">
            <MdRefresh className="text-lg" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-end">
        <MdFilterList className="text-slate-500 text-xl mt-2" />
        {(user?.role === 'admin' || user?.role === 'analyst') && (
          <div>
            <label className="label-text">District</label>
            <select value={filters.district}
              onChange={e => { setFilters(f => ({...f, district: e.target.value})); setPage(1); }}
              className="input-field w-40 py-2 text-sm">
              <option value="">All Districts</option>
              {DISTRICTS.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label-text">From Date</label>
          <input type="date" value={filters.startDate}
            onChange={e => { setFilters(f => ({...f, startDate: e.target.value})); setPage(1); }}
            className="input-field py-2 text-sm" />
        </div>
        <div>
          <label className="label-text">To Date</label>
          <input type="date" value={filters.endDate}
            onChange={e => { setFilters(f => ({...f, endDate: e.target.value})); setPage(1); }}
            className="input-field py-2 text-sm" />
        </div>
        <button onClick={() => { setFilters({ district: '', startDate: '', endDate: '' }); setPage(1); }}
          className="btn-secondary py-2 text-sm">Clear</button>
      </div>

      {/* Medicine Name Search */}
      <div className="glass-card p-4">
        <input
          placeholder="🔍 Filter by medicine name or generic name..."
          value={medicineSearch}
          onChange={e => setMedicineSearch(e.target.value)}
          className="input-field py-2 text-sm w-full"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Medicine</th>
                {user?.role !== 'pharmacy' && <th className="table-header">Pharmacy</th>}
                {user?.role !== 'pharmacy' && <th className="table-header">District</th>}
                <th className="table-header">Qty</th>
                <th className="table-header">Total</th>
                <th className="table-header">Rx Status</th>
                {isAdmin() && <th className="table-header">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(isAdmin() ? 8 : 7)].map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr><td colSpan={isAdmin() ? 8 : 7} className="text-center py-12 text-slate-500">No sales records found</td></tr>
              ) : (
                displayedSales.map(sale => (
                  <tr key={sale._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="table-cell text-xs">
                      {format(new Date(sale.saleDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-white text-sm">{sale.medicine?.name}</p>
                      <p className="text-xs text-slate-500">{sale.medicine?.category}</p>
                    </td>
                    {user?.role !== 'pharmacy' && <td className="table-cell text-xs">{sale.pharmacy?.name}</td>}
                    {user?.role !== 'pharmacy' && (
                      <td className="table-cell">
                        <span className="badge-blue">{sale.district}</span>
                      </td>
                    )}
                    <td className="table-cell font-semibold text-indigo-400">{sale.quantity}</td>
                    <td className="table-cell text-emerald-400 font-medium">
                      Rs. {sale.totalAmount?.toLocaleString()}
                    </td>
                    <td className="table-cell">{rxBadge(sale.prescriptionProvided, sale.prescriptionRequired)}</td>
                    {isAdmin() && (
                      <td className="table-cell">
                        <button onClick={() => handleDelete(sale._id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded">
                          <MdDeleteOutline className="text-lg" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
