import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject token from localStorage
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    let apiKey = localStorage.getItem('apiKey');
    if (token) {
      // strip accidental surrounding quotes or angle brackets
      token = token.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      token = token.replace(/^<|>$/g, '');
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (apiKey) {
      const clean = apiKey.replace(/^"|"$/g, '').replace(/^'|'$/g, '').replace(/^<|>$/g, '');
      config.headers['x-api-key'] = clean;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 clear token and optionally redirect to login
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('token');
        // If in a browser context, redirect to /login to re-authenticate
        if (typeof window !== 'undefined') {
          window.location.pathname = '/login';
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;
