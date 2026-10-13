import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('procom_user');
    if (stored) {
      // When Laravel backend is ready, we'll use a real token
      const token = localStorage.getItem('procom_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('procom_user');
      localStorage.removeItem('procom_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
