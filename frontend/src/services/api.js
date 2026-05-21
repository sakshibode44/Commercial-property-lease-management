import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : '/api/v1');

const api = {
  // Auth
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials),
  register: (userData) => axios.post(`${API_BASE_URL}/auth/register`, userData),

  // Properties
  getProperties: () => axios.get(`${API_BASE_URL}/properties`, { headers: getAuthHeaders() }),
  createProperty: (property) => axios.post(`${API_BASE_URL}/properties`, property, { headers: getAuthHeaders() }),

  // Tenants
  getTenants: () => axios.get(`${API_BASE_URL}/tenants`, { headers: getAuthHeaders() }),

  // Dashboard
  getDashboard: () => axios.get(`${API_BASE_URL}/dashboard`, { headers: getAuthHeaders() }),
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default api;
