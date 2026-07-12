import httpClient from './httpClient';

export const bookingService = {
  list: async (params) => {
    const response = await httpClient.get('/bookings', { params });
    return response.data;
  },
  getById: async (bookingId) => {
    const response = await httpClient.get(`/bookings/${bookingId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/bookings', payload);
    return response.data;
  },
  update: async (bookingId, payload) => {
    const response = await httpClient.patch(`/bookings/${bookingId}`, payload);
    return response.data;
  },
  remove: async (bookingId) => {
    const response = await httpClient.delete(`/bookings/${bookingId}`);
    return response.data;
  },
};
