import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (email, password) => {
  const res = await api.post('/api/auth/register', { email, password });
  if (res.data.access_token) {
    localStorage.setItem('token', res.data.access_token);
  }
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  if (res.data.access_token) {
    localStorage.setItem('token', res.data.access_token);
  }
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/api/me');
  return res.data;
};

export const updateProgress = async (progress) => {
  const res = await api.put('/api/progress', progress);
  return res.data;
};

export const updateSettings = async (settings) => {
  const res = await api.put('/api/settings', settings);
  return res.data;
};

export const saveSession = async (sessionData) => {
  const res = await api.post('/api/sessions/save', sessionData);
  return res.data;
};
