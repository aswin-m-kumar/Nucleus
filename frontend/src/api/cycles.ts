import apiClient from './client';

export const getActiveCycle = async () => {
  const response = await apiClient.get('/cycles/active');
  return response.data;
};
