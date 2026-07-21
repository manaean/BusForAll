import api from './axios';
export const getAllRoutes = () => api.get('/api/routes');
export const getRouteById = (id) => api.get(`/api/routes/${id}`);
export const getRouteStops = (id) => api.get(`/api/routes/${id}/stops`);
export const createRoute = (data) => api.post('/api/routes', data);
export const updateRoute = (id, data) => api.put(`/api/routes/${id}`, data);
export const deleteRoute = (id) => api.delete(`/api/routes/${id}`);
export const addStopToRoute = (routeId, data) => api.post(`/api/routes/${routeId}/stops`, data);
export const reorderRouteStops = (routeId, stopIds) => api.put(`/api/routes/${routeId}/stops/order`, { stopIds });
