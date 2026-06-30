import api from './axios';
export const getAlerts = (activeOnly = false) => api.get(`/api/alerts${activeOnly ? '?active=true' : ''}`);
export const createAlert = (data) => api.post('/api/alerts', data);
export const updateAlert = (id, data) => api.put(`/api/alerts/${id}`, data);
export const resolveAlert = (id) => api.patch(`/api/alerts/${id}/resolve`);
export const deleteAlert = (id) => api.delete(`/api/alerts/${id}`);
