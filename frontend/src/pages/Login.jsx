import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdLocalPharmacy, MdEmail, MdLock, MdVisibility, MdVisibilityOff,
  MdAnalytics, MdShield, MdTrendingUp, MdLocationOn, MdArrowForward
} from 'react-icons/md';

const features = [
  { icon: MdAnalytics,   title: 'Real-time Analytics',   desc: 'Live disease & sales insights across Sri Lanka' },
  { icon: MdTrendingUp,  title: 'Medicine Trends',        desc: 'Identify top-selling medicines by district'     },
  { icon: MdLocationOn,  title: '25 Districts Covered',   desc: 'Island-wide pharmacy network monitoring'        },
  { icon: MdShield,      title: 'Outbreak Alerts',        desc: 'Early warning system for disease outbreaks'     },
];

const demoAccounts = [
  { label: 'Admin',    email: 'admin@pharmasys.lk',    pw: 'Admin@2026',    role: 'Full Access',      color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)'  },
  { label: 'Analyst',  email: 'analyst@pharmasys.lk',  pw: 'Analyst@2026',  role: 'Analytics Only',   color: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.30)'  },
  { label: 'Pharmacy', email: 'colombo@pharmasys.lk',  pw: 'Pharmacy@2026', role: 'Own Data Only',    color: '#22d3ee', bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.30)'  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0f1e', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: '0 0 52%', position: 'relative', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 64px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d1117 0%, #0f172a 50%, #0d1b3e 100%)'
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Grid pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '52px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
            }}>
              <MdLocalPharmacy style={{ color: '#fff', fontSize: '28px' }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.3px' }}>MediTrend Analytics</div>
              <div style={{ color: '#6366f1', fontSize: '12px', fontWeight: 500, letterSpacing: '0.5px' }}>HEALTH INTELLIGENCE PLATFORM</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: '48px' }}>
            <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1px', margin: 0 }}>
              Data-Driven<br />
              <span style={{ background: 'linear-gradient(90deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Health Decisions</span>
            </h1>
            <p style={{ color: '#64748b', marginTop: '16px', fontSize: '15px', lineHeight: 1.7, maxWidth: '380px' }}>
              Monitor pharmacy sales, track disease outbreaks, and generate analytics across all 25 districts of Sri Lanka.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)'
                }}>
                  <f.icon style={{ color: '#818cf8', fontSize: '20px' }} />
                </div>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px' }}>{f.title}</div>
                  <div style={{ color: '#475569', fontSize: '13px', marginTop: '1px' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stat strip */}
          <div style={{ marginTop: '52px', display: 'flex', gap: '32px' }}>
            {[['25+', 'Districts'], ['500+', 'Pharmacies'], ['Real-time', 'Analytics']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ color: '#6366f1', fontWeight: 700, fontSize: '18px' }}>{val}</div>
                <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sri Lanka flag strip */}
        <div style={{ position: 'absolute', bottom: '28px', left: '64px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🇱🇰</span>
          <span style={{ color: '#334155', fontSize: '12px', fontWeight: 500 }}>Made for Sri Lanka · MediTrend Analytics © 2026</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '40px 48px', background: '#0a0f1e', position: 'relative', overflowY: 'auto'
      }}>
        {/* Subtle top glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '300px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Form header */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Welcome back</h2>
            <p style={{ color: '#475569', marginTop: '8px', fontSize: '14px' }}>Sign in to access your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px', letterSpacing: '0.3px' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <MdEmail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#6366f1' : '#475569', fontSize: '20px', transition: 'color 0.2s' }} />
                <input
                  type="email"
                  placeholder="you@pharmasys.lk"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '13px 14px 13px 44px',
                    background: focused === 'email' ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${focused === 'email' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '8px', letterSpacing: '0.3px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focused === 'pw' ? '#6366f1' : '#475569', fontSize: '20px', transition: 'color 0.2s' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('pw')}
                  onBlur={() => setFocused('')}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '13px 44px 13px 44px',
                    background: focused === 'pw' ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${focused === 'pw' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                    boxShadow: focused === 'pw' ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none'
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '20px', display: 'flex', padding: 0 }}>
                  {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(99,102,241,0.35)', transition: 'all 0.2s', fontFamily: 'inherit',
                letterSpacing: '0.2px'
              }}
            >
              {loading ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Authenticating...</>
              ) : (
                <>Sign In <MdArrowForward /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: '#334155', fontSize: '12px', fontWeight: 500, letterSpacing: '0.5px' }}>QUICK ACCESS</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Demo accounts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {demoAccounts.map(acc => (
              <button
                key={acc.label}
                onClick={() => setForm({ email: acc.email, password: acc.pw })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: '10px', border: `1px solid ${acc.border}`,
                  background: acc.bg, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.background = acc.bg.replace('0.1', '0.18').replace('0.12', '0.2'); }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = acc.bg; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${acc.color}22`, border: `1px solid ${acc.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: acc.color }}>
                    {acc.label[0]}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{acc.label}</div>
                    <div style={{ color: '#475569', fontSize: '11px', marginTop: '1px' }}>{acc.email}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: acc.color, fontSize: '11px', fontWeight: 600, background: `${acc.color}15`, padding: '2px 8px', borderRadius: '20px' }}>{acc.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
