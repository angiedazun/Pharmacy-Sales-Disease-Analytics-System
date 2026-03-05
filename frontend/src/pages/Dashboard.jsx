import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MdTrendingUp, MdLocalPharmacy, MdMedication, MdAttachMoney,
  MdFilterList, MdRefresh, MdCoronavirus, MdBarChart
} from 'react-icons/md';
import { format } from 'date-fns';

const COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#a855f7','#ec4899','#14b8a6','#f97316','#84cc16'];

const DISTRICTS = [
  'All Districts','Colombo','Gampaha','Kalutara','Kandy','Matale',
  'Nuwara Eliya','Galle','Matara','Hambantota','Jaffna',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa',
  'Badulla','Monaragala','Ratnapura','Kegalle','Batticaloa',
  'Ampara','Trincomalee','Kilinochchi','Mannar','Vavuniya'
];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="stat-card animate-slide-up">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="text-2xl text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

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

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const params = district ? { district } : {};
      const res = await analyticsAPI.dashboard(params);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [district]);

  const formatRevenue = (n) => {
    if (n >= 1e6) return `Rs. ${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `Rs. ${(n / 1e3).toFixed(1)}K`;
    return `Rs. ${n?.toFixed(0)}`;
  };

  const monthlyData = data?.monthlySales?.map(m => ({
    name: `${months[m._id.month - 1]} ${m._id.year}`,
    Sales: m.count,
    Quantity: m.totalQty,
    Revenue: Math.round(m.totalRevenue)
  })) || [];

  const topMedData = data?.topMedicines?.map(m => ({
    name: m.medicine?.name?.replace(/\s\d+mg.*/, '') || 'Unknown',
    Quantity: m.totalQty,
    Revenue: Math.round(m.totalRevenue),
    diseases: m.diseases?.map(d => d.name).join(', ')
  })) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-400">Loading dashboard data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          {user?.role === 'pharmacy' && user?.pharmacy?.name ? (
            <p className="text-slate-400 text-sm mt-0.5">
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full text-xs font-medium">
                🏥 {user.pharmacy.name} — {user.pharmacy.district} · Your pharmacy data only
              </span>
            </p>
          ) : (
            <p className="text-slate-500 text-sm mt-0.5">Real-time pharmacy sales &amp; disease monitoring · Sri Lanka</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {(user?.role === 'admin' || user?.role === 'analyst') && (
            <div className="relative">
              <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="input-field pl-9 py-2 text-sm w-48"
              >
                {DISTRICTS.map(d => <option key={d} value={d === 'All Districts' ? '' : d}>{d}</option>)}
              </select>
            </div>
          )}
          <button onClick={fetchData} disabled={refreshing}
            className="btn-secondary py-2 px-3">
            <MdRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MdTrendingUp} label="Total Sales" value={data?.totalSales?.toLocaleString() || 0}
          sub="All recorded sales" color="bg-indigo-600" trend={8} />
        <StatCard icon={MdAttachMoney} label="Total Revenue" value={formatRevenue(data?.totalRevenue || 0)}
          sub="From all sales" color="bg-emerald-600" trend={12} />
        <StatCard icon={MdLocalPharmacy} label="Active Pharmacies" value={data?.totalPharmacies || 0}
          sub="Registered & active" color="bg-cyan-600" />
        <StatCard icon={MdMedication} label="Medicine Types" value={data?.totalMedicines || 0}
          sub="In database" color="bg-purple-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <MdBarChart className="text-indigo-400 text-xl" />
            <div>
              <h2 className="section-title mb-0">Monthly Sales Trend</h2>
              <p className="text-xs text-slate-500">Last 12 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="qtyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2} fill="url(#salesGradient)" dot={false} />
              <Area type="monotone" dataKey="Quantity" stroke="#06b6d4" strokeWidth={2} fill="url(#qtyGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Medicines Pie */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <MdMedication className="text-cyan-400 text-xl" />
            <div>
              <h2 className="section-title mb-0">Top Medicines Distribution</h2>
              <p className="text-xs text-slate-500">By quantity sold</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={topMedData} dataKey="Quantity" nameKey="name" cx="50%" cy="55%"
                innerRadius={60} outerRadius={100} paddingAngle={2}
                startAngle={210} endAngle={-30}>
                {topMedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Medicines Bar Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <MdTrendingUp className="text-emerald-400 text-xl" />
          <div>
            <h2 className="section-title mb-0">Top 10 Most Sold Medicines</h2>
            <p className="text-xs text-slate-500">Ranked by total quantity dispensed</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topMedData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} width={130} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Quantity" radius={[0, 6, 6, 0]}>
              {topMedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Medicine Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdCoronavirus className="text-purple-400 text-xl" />
            <h2 className="section-title mb-0">Top Medicines With Disease Mapping</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="table-header">#</th>
                <th className="table-header">Medicine</th>
                <th className="table-header">Qty Sold</th>
                <th className="table-header">Revenue</th>
                <th className="table-header">Linked Diseases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.topMedicines?.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="table-cell">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-700/50 text-slate-400'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="table-cell">
                    <p className="font-medium text-white">{item.medicine?.name}</p>
                    <p className="text-xs text-slate-500">{item.medicine?.category}</p>
                  </td>
                  <td className="table-cell"><span className="font-bold text-indigo-400">{item.totalQty?.toLocaleString()}</span></td>
                  <td className="table-cell"><span className="text-emerald-400">Rs. {item.totalRevenue?.toLocaleString()}</span></td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {item.diseases?.slice(0, 3).map(d => (
                        <span key={d._id} className="badge-purple">{d.name}</span>
                      ))}
                      {item.diseases?.length > 3 && <span className="badge-blue">+{item.diseases.length - 3}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
