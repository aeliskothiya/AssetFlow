import httpClient from './httpClient';

export const authService = {
  login: async (payload) => {
    const response = await httpClient.post('/auth/login', payload);
    return response.data;
  },
  me: async () => {
    const response = await httpClient.get('/auth/me');
    return response.data;
  },
};
