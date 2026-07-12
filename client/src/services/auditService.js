import httpClient from './httpClient';

export const auditService = {
  listCycles: async (params) => {
    const response = await httpClient.get('/audits', { params });
    return response.data;
  },
  getCycle: async (cycleId) => {
    const response = await httpClient.get(`/audits/${cycleId}`);
    return response.data;
  },
  createCycle: async (payload) => {
    const response = await httpClient.post('/audits', payload);
    return response.data;
  },
  updateCycle: async (cycleId, payload) => {
    const response = await httpClient.patch(`/audits/${cycleId}`, payload);
    return response.data;
  },
  removeCycle: async (cycleId) => {
    const response = await httpClient.delete(`/audits/${cycleId}`);
    return response.data;
  },
  listRecords: async (cycleId) => {
    const response = await httpClient.get(`/audits/${cycleId}/records`);
    return response.data;
  },
  createRecord: async (cycleId, payload) => {
    const response = await httpClient.post(`/audits/${cycleId}/records`, payload);
    return response.data;
  },
};
