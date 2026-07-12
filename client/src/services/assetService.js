import httpClient from './httpClient';

export const assetService = {
  list: async (params) => {
    const response = await httpClient.get('/assets', { params });
    return response.data;
  },
  getById: async (assetId) => {
    const response = await httpClient.get(`/assets/${assetId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/assets', payload);
    return response.data;
  },
  update: async (assetId, payload) => {
    const response = await httpClient.patch(`/assets/${assetId}`, payload);
    return response.data;
  },
  remove: async (assetId) => {
    const response = await httpClient.delete(`/assets/${assetId}`);
    return response.data;
  },
};
