import httpClient from './httpClient';

export const transferService = {
  list: async (params) => {
    const response = await httpClient.get('/transfers', { params });
    return response.data;
  },
  getById: async (transferId) => {
    const response = await httpClient.get(`/transfers/${transferId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/transfers', payload);
    return response.data;
  },
  updateStatus: async (transferId, status, comments) => {
    const response = await httpClient.patch(`/transfers/${transferId}/status`, { status, comments });
    return response.data;
  },
};
