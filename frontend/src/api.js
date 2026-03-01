import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 60000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Sites APIs
export const sitesApi = {
  list: () => api.get('/sites'),
  create: (data) => api.post('/sites', data),
  get: (id) => api.get(`/sites/${id}`),
  delete: (id) => api.delete(`/sites/${id}`),
  update: (id, data) => api.patch(`/sites/${id}`, data),
  deploy: (id, formData, onProgress) => api.post(`/sites/${id}/deploy`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
      : undefined,
  }),
  getDeployments: (id) => api.get(`/sites/${id}/deployments`),
  getAnalytics: (id) => api.get(`/sites/${id}/analytics`),
};

// User APIs
export const userApi = {
  stats: () => api.get('/user/stats'),
};

export const API_BASE_URL = API_BASE;
export default api;
