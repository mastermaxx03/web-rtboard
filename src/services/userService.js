// example: src/services/userService.js
import api from '../utils/axiosInstance';

export const getProfile = async () => {
  const res = await api.get('/api/v1/user/profile');
  return res.data;
};

export const updateSomething = async (payload) => {
  const res = await api.post('/api/v1/thing', payload);
  return res.data;
};
