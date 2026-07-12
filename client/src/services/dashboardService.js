import httpClient from './httpClient';

export const dashboardService = {
  overview: async () => {
    const response = await httpClient.get('/dashboard/overview');
    return response.data;
  },
};
