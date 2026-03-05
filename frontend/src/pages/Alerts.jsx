import React, { useState, useEffect } from 'react';
import { alertsAPI } from '../services/api';
import { MdWarning, MdRefresh, MdCoronavirus, MdTrendingUp, MdLocationOn, MdNotifications } from 'react-icons/md';

const SEVERITY_CONFIG = {
  Critical: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', badge: 'badge-red', dot: 'bg-red-500' },
  High:     { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'badge-red', dot: 'bg-orange-500' },
  Medium:   { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', badge: 'badge-yellow', dot: 'bg-amber-500' },
  Low:      { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'badge-green', dot: 'bg-emerald-500' }
};

export default function Alerts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    setRefreshing(true);
    try {
      const res = await alertsAPI.getAll();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-400">Scanning for outbreaks...</p>
      </div>
    </div>
  );

  const { alerts = [], summary = {}, topDistricts = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MdWarning className="text-red-400" /> Outbreak Alerts
          </h1>
          <p className="text-slate-500 text-sm">Disease surge detection — last 30 days vs previous 30 days</p>
        </div>
        <button onClick={fetchAlerts} disabled={refreshing} className="btn-secondary py-2">
          <MdRefresh className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: summary.total || 0, color: 'text-white', bg: 'bg-slate-800/80', icon: MdNotifications },
          { label: 'Critical Surges', value: summary.critical || 0, color: 'text-red-400', bg: 'bg-red-500/10 border border-red-500/20', icon: MdWarning },
          { label: 'High Priority', value: summary.high || 0, color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20', icon: MdTrendingUp },
          { label: 'Notifiable Diseases', value: summary.notifiable || 0, color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20', icon: MdCoronavirus }
        ].map((c, i) => (
          <div key={i} className={`glass-card p-4 ${c.bg}`}>
            <c.icon className={`text-2xl ${c.color} mb-2`} />
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Alert Threshold Info */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center text-xs text-slate-400">
        <span className="font-medium text-slate-300">Alert Logic:</span>
        <span>🔴 Critical — &gt;100% surge in 30 days</span>
        <span>🟠 High — &gt;50% surge or high-severity disease spike</span>
        <span>⭐ Notifiable — government-reportable diseases</span>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MdCoronavirus className="text-6xl text-emerald-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg">No Active Alerts</h3>
          <p className="text-slate-500 text-sm mt-1">No disease surges detected in the last 30 days</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const cfg = SEVERITY_CONFIG[alert.alertLevel] || SEVERITY_CONFIG.Medium;
            return (
              <div key={i} className={`glass-card p-5 border ${cfg.border} ${cfg.bg} rounded-xl`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${cfg.dot} animate-pulse`}></span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{alert.disease}</h3>
                        <span className={cfg.badge}>{alert.alertLevel}</span>
                        <span className="badge-blue">{alert.category}</span>
                        {alert.isNotifiable && <span className="badge-red">⚑ Notifiable</span>}
                      </div>
                      <p className={`text-sm mt-1 ${cfg.text}`}>
                        <strong>{alert.percentChange > 0 ? '+' : ''}{alert.percentChange}% change</strong>
                        {' — '}{alert.current30Days.toLocaleString()} units sold (vs {alert.prev30Days.toLocaleString()} prior period)
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-bold ${cfg.text}`}>
                      {alert.percentChange > 0 ? '▲' : '▼'} {Math.abs(alert.percentChange)}%
                    </p>
                    <p className="text-slate-500 text-xs">30-day trend</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top Districts */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <MdLocationOn className="text-indigo-400" /> Top Districts by Medicine Volume (Last 30 Days)
        </h3>
        <div className="space-y-3">
          {topDistricts.map((d, i) => {
            const max = topDistricts[0]?.totalQty || 1;
            const pct = Math.round((d.totalQty / max) * 100);
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white font-medium">{d._id}</span>
                  <span className="text-slate-400">{d.totalQty.toLocaleString()} units | LKR {d.totalRevenue?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
