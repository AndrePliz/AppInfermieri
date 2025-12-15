import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// SOSTITUISCI CON IL TUO IP REALE TROVATO SOPRA
// Esempio: 'http://192.168.1.13:3000/api'
const API_URL = 'http://192.168.1.44:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
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