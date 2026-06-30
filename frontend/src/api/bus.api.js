import api from './axios';
export const getAllBuses = () => api.get('/api/buses');
export const getBusById = (id) => api.get(`/api/buses/${id}`);
export const createBus = (data) => api.post('/api/buses', data);
export const updateBus = (id, data) => api.put(`/api/buses/${id}`, data);
export const deleteBus = (id) => api.delete(`/api/buses/${id}`);
