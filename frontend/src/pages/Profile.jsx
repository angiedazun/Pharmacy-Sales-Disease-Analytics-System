import React, { useState } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdLock, MdSave, MdCheckCircle, MdShield, MdEmail } from 'react-icons/md';

export default function Profile() {
  const { user, login } = useAuth();
  const [tab, setTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password form
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await profileAPI.update(profile);
      const updatedUser = res.data.data;
      // Update localStorage
      localStorage.setItem('pharma_user', JSON.stringify({ ...user, name: updatedUser.name, email: updatedUser.email }));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword !== pw.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (pw.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setPwLoading(true);
    try {
      await profileAPI.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed' });
    } finally {
      setPwLoading(false);
    }
  };

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    pharmacy: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    analyst: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-slate-500 text-sm">Manage your account settings and security</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-lg shadow-indigo-500/30">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[user?.role]}`}>
            <MdShield className="text-xs" />
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            {user?.pharmacy?.name ? ` — ${user.pharmacy.name}` : ''}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-0">
        {[{ id: 'profile', icon: MdPerson, label: 'Profile Info' }, { id: 'password', icon: MdLock, label: 'Change Password' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            <t.icon /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-5">Update Personal Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label-text">Full Name</label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="input-field pl-10" placeholder="Your name" required />
              </div>
            </div>
            <div>
              <label className="label-text">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-10" placeholder="your@email.com" required />
              </div>
            </div>
            {profileMsg && (
              <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {profileMsg.type === 'success' && <MdCheckCircle />}
                {profileMsg.text}
              </div>
            )}
            <button type="submit" disabled={profileLoading} className="btn-primary w-full">
              {profileLoading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span> : <MdSave />}
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-5">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label-text">Current Password</label>
              <input type="password" value={pw.currentPassword} onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))}
                className="input-field" placeholder="Enter current password" required />
            </div>
            <div>
              <label className="label-text">New Password</label>
              <input type="password" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                className="input-field" placeholder="Min. 6 characters" required />
            </div>
            <div>
              <label className="label-text">Confirm New Password</label>
              <input type="password" value={pw.confirmPassword} onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))}
                className="input-field" placeholder="Repeat new password" required />
              {pw.confirmPassword && pw.newPassword !== pw.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
            {pwMsg && (
              <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${pwMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {pwMsg.type === 'success' && <MdCheckCircle />} {pwMsg.text}
              </div>
            )}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs">
              ⚠ You will need to log in again after changing your password.
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary w-full">
              {pwLoading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span> : <MdLock />}
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
