import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { MdCoronavirus, MdMap, MdFilterList, MdWarning } from 'react-icons/md';
import SriLankaMap from '../components/SriLankaMap';

const COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#a855f7','#ec4899','#14b8a6','#f97316','#84cc16','#3b82f6','#d946ef','#22d3ee','#fb923c','#4ade80'];

const SEVERITY_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Critical: '#dc2626' };

const DISTRICTS = [
  '','Colombo','Gampaha','Kalutara','Kandy','Matale',
  'Nuwara Eliya','Galle','Matara','Hambantota','Jaffna',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa',
  'Badulla','Monaragala','Ratnapura','Kegalle','Batticaloa',
  'Ampara','Trincomalee','Kilinochchi','Mannar','Vavuniya'
];

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

export default function Analytics() {
  const [diseaseData, setDiseaseData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [districtDiseaseData, setDistrictDiseaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');

  useEffect(() => {
    fetchAll();
  }, [district]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = district ? { district } : {};
      const [diseaseRes, heatRes, ddRes] = await Promise.all([
        analyticsAPI.diseases(params),
        analyticsAPI.districtHeatmap(params),
        analyticsAPI.diseaseDistrict({})
      ]);
      setDiseaseData(diseaseRes.data.data);
      setHeatmapData(heatRes.data.data);
      setDistrictDiseaseData(ddRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const radarData = diseaseData.slice(0, 8).map(d => ({
    disease: d.disease?.length > 15 ? d.disease.substring(0, 15) + '…' : d.disease,
    Frequency: d.totalQty
  }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-400">Analyzing disease data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Disease Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Medicine-to-disease mapping & trend estimation</p>
        </div>
        <select value={district} onChange={e => setDistrict(e.target.value)} className="input-field w-48 py-2 text-sm">
          <option value="">All Districts</option>
          {DISTRICTS.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <MdWarning className="text-amber-400 text-xl flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 font-medium text-sm">Important Notice</p>
          <p className="text-amber-300/70 text-xs mt-0.5">
            This system provides <strong>trend estimation only</strong>, not medical diagnosis. 
            Medicine sales data is an indirect indicator — some medicines treat multiple diseases, 
            and self-medication affects accuracy. Data is for health monitoring purposes only.
          </p>
        </div>
      </div>

      {/* Disease Bar Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <MdCoronavirus className="text-red-400 text-xl" />
          <div>
            <h2 className="section-title mb-0">Most Common Diseases (Estimated)</h2>
            <p className="text-xs text-slate-500">Inferred from medicine sales data</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={diseaseData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="disease" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalQty" name="Medicine Sales (Indicator)" radius={[6, 6, 0, 0]}>
              {diseaseData.map((d, i) => (
                <Cell key={i} fill={SEVERITY_COLORS[d.severity] || COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {Object.entries(SEVERITY_COLORS).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded" style={{ background: c }}></span>{s} Severity
            </span>
          ))}
        </div>
      </div>

      {/* Disease Table + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-card p-6">
          <h2 className="section-title mb-5">Disease Frequency Radar</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="disease" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Frequency" dataKey="Frequency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Disease List */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="section-title mb-0">Disease Rankings</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {diseaseData.map((d, i) => {
              const max = diseaseData[0]?.totalQty || 1;
              const pct = Math.round((d.totalQty / max) * 100);
              return (
                <div key={i} className="px-6 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-5">#{i + 1}</span>
                      <span className="text-sm font-medium text-white">{d.disease}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{d.totalQty?.toLocaleString()} sales</span>
                      <span className={`badge-${d.severity === 'Low' ? 'green' : d.severity === 'Medium' ? 'yellow' : d.severity === 'High' ? 'red' : 'red'}`}>
                        {d.severity}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: SEVERITY_COLORS[d.severity] }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* District Heatmap — Map + Grid */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <MdMap className="text-cyan-400 text-xl" />
          <div>
            <h2 className="section-title mb-0">District Sales Heatmap</h2>
            <p className="text-xs text-slate-500">Medicine sales volume by district — hover map for details</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sri Lanka Map */}
          <div>
            <SriLankaMap heatmapData={heatmapData} />
          </div>
          {/* District Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 h-fit">
            {heatmapData.map((d, i) => {
              const max = heatmapData[0]?.totalQty || 1;
              const intensity = d.totalQty / max;
              return (
                <div key={i}
                  className="p-3 rounded-xl border transition-all hover:scale-105 cursor-default"
                  style={{
                    background: `rgba(99, 102, 241, ${0.1 + intensity * 0.5})`,
                    borderColor: `rgba(99, 102, 241, ${0.2 + intensity * 0.4})`
                  }}
                >
                  <p className="text-xs font-semibold text-white truncate">{d._id}</p>
                  <p className="text-lg font-bold" style={{ color: `rgba(165, 180, 252, ${0.6 + intensity * 0.4})` }}>
                    {d.totalQty?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">{d.saleCount} records</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
