import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdAddCircle, MdHistory, MdAnalytics,
  MdLocalPharmacy, MdMedication, MdCoronavirus, MdPeople,
  MdLogout, MdClose, MdShield, MdWarning, MdTrendingUp, MdPerson, MdSecurity
} from 'react-icons/md';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
        isActive
          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }`
    }
  >
    <Icon className="text-xl flex-shrink-0" />
    <span>{label}</span>
  </NavLink>
);

const SectionLabel = ({ label }) => (
  <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-600 uppercase tracking-widest">{label}</p>
);

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    pharmacy: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    analyst: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:relative z-30 h-full flex flex-col
        w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800
        transition-transform duration-300 ease-in-out flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <MdLocalPharmacy className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">MediTrend Analytics</h1>
              <p className="text-xs text-slate-500">🇱🇰 Sri Lanka</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-300 p-1">
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* User Badge */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[user?.role]}`}>
                <MdShield className="text-xs" />
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-2 space-y-0.5 pb-4">
          <SectionLabel label="Overview" />
          <NavItem to="/dashboard" icon={MdDashboard} label="Dashboard" />

          <SectionLabel label="Sales" />
          {(user?.role === 'admin' || user?.role === 'pharmacy') && (
            <NavItem to="/sales/new" icon={MdAddCircle} label="Record Sale" />
          )}
          <NavItem to="/sales/history" icon={MdHistory} label="Sales History" />

          {(user?.role === 'admin' || user?.role === 'analyst') && (
            <>
              <SectionLabel label="Analytics" />
              <NavItem to="/analytics" icon={MdAnalytics} label="Disease Analytics" />
              <NavItem to="/analytics/trend" icon={MdTrendingUp} label="Medicine Trend" />
              <NavItem to="/alerts" icon={MdWarning} label="Outbreak Alerts" />
            </>
          )}

          {isAdmin() && (
            <>
              <SectionLabel label="Administration" />
              <NavItem to="/admin/pharmacies" icon={MdLocalPharmacy} label="Pharmacies" />
              <NavItem to="/admin/medicines" icon={MdMedication} label="Medicines" />
              <NavItem to="/admin/diseases" icon={MdCoronavirus} label="Diseases" />
              <NavItem to="/admin/users" icon={MdPeople} label="Users" />
              <NavItem to="/admin/audit" icon={MdSecurity} label="Audit Logs" />
            </>
          )}

          <SectionLabel label="Account" />
          <NavItem to="/profile" icon={MdPerson} label="My Profile" />
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <MdLogout className="text-xl" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
