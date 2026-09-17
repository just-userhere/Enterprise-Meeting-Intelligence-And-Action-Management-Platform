import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const errMsg = (e, fallback = 'Something went wrong.') =>
  e?.response?.data?.detail || e?.message || fallback;

export default api;
