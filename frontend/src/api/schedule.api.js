import api from './axios';
export const getAllSchedules = () => api.get('/api/schedules');
export const getSchedulesByRoute = (routeId) => api.get(`/api/schedules/route/${routeId}`);
export const createSchedule = (data) => api.post('/api/schedules', data);
export const updateSchedule = (id, data) => api.put(`/api/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/api/schedules/${id}`);
