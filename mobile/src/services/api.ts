import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondi timeout
});

// Interceptor: Inserisce il token automaticamente in ogni chiamata futura
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;