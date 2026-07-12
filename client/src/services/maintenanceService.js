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
};
