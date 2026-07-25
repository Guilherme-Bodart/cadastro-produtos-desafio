import axios from 'axios';
import { storage } from '@/lib/storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.15.16:3333',
});

// Request interceptor – inject JWT from storage
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItem('token');
      // Optionally you could navigate to login, but services should just reject
    }
    return Promise.reject(error);
  }
);

export default api;
