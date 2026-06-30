import api from './axios';
export const getAllDrivers = () => api.get('/api/drivers');
export const getDriverById = (id) => api.get(`/api/drivers/${id}`);
export const createDriver = (data) => api.post('/api/drivers', data);
export const updateDriver = (id, data) => api.put(`/api/drivers/${id}`, data);
export const deleteDriver = (id) => api.delete(`/api/drivers/${id}`);
export const getMyDriverProfile = () => api.get('/api/drivers/me');
export const getMyAssignment = () => api.get('/api/drivers/me/assignment');

export const getAllAssignments = () => api.get('/api/assignments');
export const createAssignment = (data) => api.post('/api/assignments', data);
export const updateAssignment = (id, data) => api.put(`/api/assignments/${id}`, data);
export const deleteAssignment = (id) => api.delete(`/api/assignments/${id}`);

export const getAllDelays = () => api.get('/api/delays');
export const getActiveDelay = (routeId) => api.get(`/api/delays/route/${routeId}`);
export const createDelay = (data) => api.post('/api/delays', data);
export const resolveDelay = (id) => api.patch(`/api/delays/${id}/resolve`);
export const deleteDelay = (id) => api.delete(`/api/delays/${id}`);
