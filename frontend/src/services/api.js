import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:3443/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Children API
export const childrenAPI = {
  getAll: () => api.get('/children'),
  getOne: (childId) => api.get(`/children/${childId}`),
  create: (data) => api.post('/children', data),
  update: (childId, data) => api.put(`/children/${childId}`, data),
  delete: (childId) => api.delete(`/children/${childId}`),
  createTrackerToken: (childId) => api.post(`/children/${childId}/tracker-token`),
  getLatestLocation: (childId) => api.get(`/children/${childId}/location/latest`),
  getLocationHistory: (childId, params) => api.get(`/children/${childId}/location/history`, { params }),
};

// Zones API
export const zonesAPI = {
  getAll: (childId) => api.get(`/children/${childId}/zones`),
  create: (childId, data) => api.post(`/children/${childId}/zones`, data),
  update: (zoneId, data) => api.put(`/zones/${zoneId}`, data),
  delete: (zoneId) => api.delete(`/zones/${zoneId}`),
};

// Alerts API
export const alertsAPI = {
  getAll: (childId, params) => api.get(`/children/${childId}/alerts`, { params }),
  markAsRead: (alertId) => api.post(`/alerts/${alertId}/read`),
  markAllAsRead: (childId) => api.post(`/children/${childId}/alerts/read-all`),
};

// Realtime SSE
export const createSSEConnection = (childId, onMessage) => {
  const token = localStorage.getItem('token');
  const eventSource = new EventSource(`${API_BASE_URL}/realtime/children/${childId}/events?token=${token}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
  };
  
  return eventSource;
};

export default api;
