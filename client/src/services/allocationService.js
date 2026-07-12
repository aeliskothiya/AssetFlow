import httpClient from './httpClient';

export const allocationService = {
  list: async (params) => {
    const response = await httpClient.get('/allocations', { params });
    return response.data;
  },
  getById: async (allocationId) => {
    const response = await httpClient.get(`/allocations/${allocationId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/allocations', payload);
    return response.data;
  },
  returnAsset: async (allocationId, payload) => {
    const response = await httpClient.patch(`/allocations/${allocationId}/return`, payload);
    return response.data;
  },
};
