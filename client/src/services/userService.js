import httpClient from './httpClient';

export const userService = {
  list: async (params) => {
    const response = await httpClient.get('/users', { params });
    return response.data;
  },
  updateRole: async (userId, role) => {
    const response = await httpClient.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  },
};
