import httpClient from './httpClient';

export const reportService = {
  department: async () => {
    const response = await httpClient.get('/reports/department');
    return response.data;
  },
  assets: async () => {
    const response = await httpClient.get('/reports/assets');
    return response.data;
  },
  maintenance: async () => {
    const response = await httpClient.get('/reports/maintenance');
    return response.data;
  },
  audit: async () => {
    const response = await httpClient.get('/reports/audit');
    return response.data;
  },
  bookings: async () => {
    const response = await httpClient.get('/reports/bookings');
    return response.data;
  },
};
