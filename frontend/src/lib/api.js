import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || ''; 
// Actually in dev with proxy it might be /api, but explicit URL is safer if defined.
// If env is set, use it. If not, assume same host/proxy.

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('token', res.data.access_token);
  return res.data;
};

export const register = async (email, password) => {
  const res = await api.post('/api/auth/register', { email, password });
  localStorage.setItem('token', res.data.access_token);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/api/me');
  return res.data;
};

export const saveSession = async (data) => {
  const res = await api.post('/api/sessions/save', data);
  return res.data;
};

export const updateSettings = async (settings) => {
  const res = await api.put('/api/settings', settings);
  return res.data;
};

export default api;
