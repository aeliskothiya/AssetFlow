import httpClient from './httpClient';

export const categoryService = {
  list: async (params) => {
    const response = await httpClient.get('/asset-categories', { params });
    return response.data;
  },
  getById: async (categoryId) => {
    const response = await httpClient.get(`/asset-categories/${categoryId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/asset-categories', payload);
    return response.data;
  },
  update: async (categoryId, payload) => {
    const response = await httpClient.patch(`/asset-categories/${categoryId}`, payload);
    return response.data;
  },
  remove: async (categoryId) => {
    const response = await httpClient.delete(`/asset-categories/${categoryId}`);
    return response.data;
  },
};
