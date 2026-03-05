import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { analyticsAPI, medicinesAPI } from '../services/api';
import { MdMedication, MdTrendingUp, MdFilterList, MdBarChart } from 'react-icons/md';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span></p>
      ))}
    </div>
  );
};

export default function MedicineTrend() {
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState('');
  const [trendData, setTrendData] = useState([]);
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMeds, setLoadingMeds] = useState(true);

  useEffect(() => {
    medicinesAPI.getAll({ limit: 200 }).then(res => {
      setMedicines(res.data.data);
      if (res.data.data.length > 0) {
        setSelected(res.data.data[0]._id);
        setMedicineInfo(res.data.data[0]);
      }
      setLoadingMeds(false);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    analyticsAPI.medicineTrend(selected).then(res => {
      const raw = res.data.data;
      const formatted = raw.map(d => ({
        month: `${MONTHS[d._id.month - 1]} ${d._id.year}`,
        'Units Sold': d.totalQty,
        'Revenue (LKR)': Math.round(d.totalRevenue)
      }));
      setTrendData(formatted);
    }).catch(console.error).finally(() => setLoading(false));
    const med = medicines.find(m => m._id === selected);
    setMedicineInfo(med || null);
  }, [selected]);

  const totalUnits = trendData.reduce((s, d) => s + (d['Units Sold'] || 0), 0);
  const totalRevenue = trendData.reduce((s, d) => s + (d['Revenue (LKR)'] || 0), 0);
  const peakMonth = trendData.reduce((a, b) => (a['Units Sold'] > b['Units Sold'] ? a : b), trendData[0] || {});
  const avgMonthly = trendData.length ? Math.round(totalUnits / trendData.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2"><MdTrendingUp className="text-indigo-400" /> Medicine Sales Trend</h1>
        <p className="text-slate-500 text-sm">Monthly dispensing history per medicine</p>
      </div>

      {/* Medicine Selector */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-end">
        <MdFilterList className="text-slate-500 text-xl mt-2" />
        <div className="flex-1 min-w-[260px]">
          <label className="label-text">Select Medicine</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field py-2 text-sm" disabled={loadingMeds}>
            {medicines.map(m => (
              <option key={m._id} value={m._id}>{m.name} ({m.genericName || m.category})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicine Info Card */}
      {medicineInfo && (
        <div className="glass-card p-5 flex flex-wrap gap-4 items-center">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <MdMedication className="text-indigo-400 text-2xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{medicineInfo.name}</h2>
            <p className="text-slate-400 text-sm">{medicineInfo.genericName} — {medicineInfo.category}</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalUnits.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Units</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">LKR {totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{avgMonthly.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Avg / Month</p>
            </div>
            {peakMonth.month && (
              <div className="text-center">
                <p className="text-sm font-bold text-amber-400">{peakMonth.month}</p>
                <p className="text-xs text-slate-500">Peak Month</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      ) : trendData.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MdBarChart className="text-6xl text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No sales data for this medicine</p>
        </div>
      ) : (
        <>
          {/* Area Chart — Units Sold */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Monthly Units Dispensed</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="unitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Units Sold" stroke="#6366f1" fill="url(#unitGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart — Revenue */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Monthly Revenue (LKR)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Revenue (LKR)" fill="#06b6d4" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
