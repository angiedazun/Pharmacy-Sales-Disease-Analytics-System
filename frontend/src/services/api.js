import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharma_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pharma_token');
      localStorage.removeItem('pharma_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me')
};

// ─── Analytics ─────────────────────────────────────────────
export const analyticsAPI = {
  dashboard: (params) => API.get('/analytics/dashboard', { params }),
  diseases: (params) => API.get('/analytics/diseases', { params }),
  districtHeatmap: (params) => API.get('/analytics/district-heatmap', { params }),
  medicineTrend: (id) => API.get(`/analytics/medicine-trend/${id}`),
  diseaseDistrict: (params) => API.get('/analytics/disease-district', { params })
};

// ─── Sales ─────────────────────────────────────────────────
export const salesAPI = {
  getAll: (params) => API.get('/sales', { params }),
  create: (data) => API.post('/sales', data),
  update: (id, data) => API.put(`/sales/${id}`, data),
  delete: (id) => API.delete(`/sales/${id}`)
};

// ─── Medicines ─────────────────────────────────────────────
export const medicinesAPI = {
  getAll: (params) => API.get('/medicines', { params }),
  getOne: (id) => API.get(`/medicines/${id}`),
  create: (data) => API.post('/medicines', data),
  update: (id, data) => API.put(`/medicines/${id}`, data),
  delete: (id) => API.delete(`/medicines/${id}`)
};

// ─── Diseases ──────────────────────────────────────────────
export const diseasesAPI = {
  getAll: (params) => API.get('/diseases', { params }),
  getOne: (id) => API.get(`/diseases/${id}`),
  create: (data) => API.post('/diseases', data),
  update: (id, data) => API.put(`/diseases/${id}`, data),
  delete: (id) => API.delete(`/diseases/${id}`)
};

// ─── Pharmacies ────────────────────────────────────────────
export const pharmaciesAPI = {
  getAll: (params) => API.get('/pharmacies', { params }),
  getOne: (id) => API.get(`/pharmacies/${id}`),
  create: (data) => API.post('/pharmacies', data),
  update: (id, data) => API.put(`/pharmacies/${id}`, data),
  delete: (id) => API.delete(`/pharmacies/${id}`)
};

// ─── Users ─────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => API.get('/users'),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`)
};

// ─── Profile ───────────────────────────────────────────────
export const profileAPI = {
  update: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data)
};

// ─── Alerts ────────────────────────────────────────────────
export const alertsAPI = {
  getAll: () => API.get('/alerts')
};

// ─── Audit Logs ────────────────────────────────────────────
export const auditAPI = {
  getAll: (params) => API.get('/audit', { params })
};

// ─── CSV Export ────────────────────────────────────────────
export const exportSalesCSV = async (params = {}) => {
  const response = await API.get('/sales/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `meditrend-sales-${new Date().toISOString().substring(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export default API;
