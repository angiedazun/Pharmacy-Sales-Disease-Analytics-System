import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesEntry from './pages/SalesEntry';
import SalesHistory from './pages/SalesHistory';
import Analytics from './pages/Analytics';
import MedicineTrend from './pages/MedicineTrend';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Medicines from './pages/admin/Medicines';
import Diseases from './pages/admin/Diseases';
import Pharmacies from './pages/admin/Pharmacies';
import Users from './pages/admin/Users';
import AuditLogs from './pages/admin/AuditLogs';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales/new" element={<ProtectedRoute roles={['admin','pharmacy']}><SalesEntry /></ProtectedRoute>} />
        <Route path="/sales/history" element={<SalesHistory />} />
        <Route path="/analytics" element={<ProtectedRoute roles={['admin','analyst']}><Analytics /></ProtectedRoute>} />
        <Route path="/analytics/trend" element={<ProtectedRoute roles={['admin','analyst']}><MedicineTrend /></ProtectedRoute>} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/medicines" element={<ProtectedRoute roles={['admin']}><Medicines /></ProtectedRoute>} />
        <Route path="/admin/diseases" element={<ProtectedRoute roles={['admin']}><Diseases /></ProtectedRoute>} />
        <Route path="/admin/pharmacies" element={<ProtectedRoute roles={['admin']}><Pharmacies /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

