import httpClient from './httpClient';

export const departmentService = {
  list: async (params) => {
    const response = await httpClient.get('/departments', { params });
    return response.data;
  },
  getById: async (departmentId) => {
    const response = await httpClient.get(`/departments/${departmentId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/departments', payload);
    return response.data;
  },
  update: async (departmentId, payload) => {
    const response = await httpClient.patch(`/departments/${departmentId}`, payload);
    return response.data;
  },
  remove: async (departmentId) => {
    const response = await httpClient.delete(`/departments/${departmentId}`);
    return response.data;
  },
};
