import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdNotifications, MdWarning } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { alertsAPI } from '../services/api';
import { format } from 'date-fns';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    alertsAPI.getAll().then(res => {
      setAlertCount(res.data.summary?.total || 0);
    }).catch(() => {});
  }, []);

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-all"
        >
          <MdMenu className="text-2xl" />
        </button>
        <div>
          <p className="text-sm font-semibold text-white">MediTrend Analytics</p>
          <p className="text-xs text-slate-500">{format(new Date(), 'EEEE, MMM dd yyyy')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-medium">System Online</span>
        </div>

        {/* Alert Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
          title="Outbreak Alerts"
        >
          <MdNotifications className="text-2xl" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        <button onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-indigo-400 transition-all"
          title="My Profile">
          {user?.name?.charAt(0)?.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
