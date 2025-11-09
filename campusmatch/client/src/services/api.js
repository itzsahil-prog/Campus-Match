import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
};

// User API
export const userAPI = {
  getMe: () => api.get('/users/me'),
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadPhoto: (formData) => api.post('/users/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePhoto: (index) => api.delete(`/users/profile/photo/${index}`),
  updateSettings: (data) => api.put('/users/settings', data)
};

// Match API
export const matchAPI = {
  getSuggestions: () => api.get('/matches/suggestions'),
  swipe: (data) => api.post('/matches/swipe', data),
  getMatches: () => api.get('/matches/matches'),
  unmatch: (id) => api.delete(`/matches/match/${id}`)
};

export default api;
