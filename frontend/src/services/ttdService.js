import { api } from '../utils/api';

export const getTtd = async () => {
  const res = await api.get('/ttd/current-ttd');
  return res.data;
};

export const uploadTtd = async (formData) => {
  const res = await api.postFormData('/ttd/upload-ttd', formData);
  return res.data;
};
