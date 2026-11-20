import axios from 'axios';

const defaultBaseUrl = import.meta.env.DEV
  ? '/api'
  : 'https://vibe-todo-7rhs.onrender.com/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout to allow Render wakeups
});

let onServerWakeUpCallback = null;

export const registerServerWakeUpCallback = (callback) => {
  onServerWakeUpCallback = callback;
};

// Interceptor to attach Authorization Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vibe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle errors, cold starts, and 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkOrTimeout = !error.response || error.code === 'ECONNABORTED';
    const isServerWakingError = error.response && [502, 503, 504].includes(error.response.status);

    // If backend is sleeping / cold starting, trigger wake-up polling banner
    if ((isNetworkOrTimeout || isServerWakingError) && !error.config?.url?.includes('/health')) {
      if (typeof onServerWakeUpCallback === 'function') {
        onServerWakeUpCallback();
      }
    }

    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('vibe_token');
      localStorage.removeItem('vibe_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (email, password) => {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const todoApi = {
  getTodos: async ({ search = '', page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/todos?${params.toString()}`);
    return response.data;
  },
  createTodo: async ({ title, description }) => {
    const response = await api.post('/todos', { title, description });
    return response.data;
  },
  updateTodo: async (id, updates) => {
    const response = await api.patch(`/todos/${id}`, updates);
    return response.data;
  },
  deleteTodo: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },
};

export default api;
