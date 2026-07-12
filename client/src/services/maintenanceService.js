import httpClient from './httpClient';

export const maintenanceService = {
  list: async (params) => {
    const response = await httpClient.get('/maintenance', { params });
    return response.data;
  },
  getById: async (maintenanceId) => {
    const response = await httpClient.get(`/maintenance/${maintenanceId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/maintenance', payload);
    return response.data;
  },
  update: async (maintenanceId, payload) => {
    const response = await httpClient.patch(`/maintenance/${maintenanceId}`, payload);
    return response.data;
  },
  approve: async (maintenanceId) => {
    const response = await httpClient.post(`/maintenance/${maintenanceId}/approve`);
    return response.data;
  },
  assign: async (maintenanceId, payload) => {
    const response = await httpClient.post(`/maintenance/${maintenanceId}/assign`, payload);
    return response.data;
  },
  progress: async (maintenanceId) => {
    const response = await httpClient.post(`/maintenance/${maintenanceId}/progress`);
    return response.data;
  },
  resolve: async (maintenanceId, payload) => {
    const response = await httpClient.post(`/maintenance/${maintenanceId}/resolve`, payload);
    return response.data;
  },
};
