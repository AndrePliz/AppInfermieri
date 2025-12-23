import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondi timeout
});

// --- Request Interceptor ---
// Inserisce il token automaticamente in ogni chiamata futura
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response Interceptor ---
// Centralizza la gestione degli errori di rete
api.interceptors.response.use(
  // Se la risposta è di successo (status 2xx), la passa semplicemente
  (response) => response,
  
  // Se c'è un errore, lo processa qui prima di passarlo al blocco .catch()
  (error: AxiosError) => {
    let userFriendlyMessage = 'Si è verificato un errore inaspettato.';

    if (error.response) {
      // Il server ha risposto con uno status code di errore (4xx, 5xx)
      // Usiamo il messaggio specifico inviato dal backend, se esiste
      const serverMessage = (error.response.data as any)?.message;
      userFriendlyMessage = serverMessage || `Errore dal server: ${error.response.status}`;
    } else if (error.request) {
      // La richiesta è stata inviata ma non è stata ricevuta risposta (es. no internet)
      userFriendlyMessage = 'Impossibile connettersi al server. Controlla la tua connessione internet.';
    }

    // Per mantenere l'errore originale disponibile per il debug, se necessario
    console.error("API Error Interceptor:", error);

    // Creiamo un nuovo oggetto errore con solo il messaggio user-friendly
    // e lo "rigettiamo" in modo che il blocco .catch() del chiamante lo riceva.
    // Usiamo `Error` per assicurarci di avere una proprietà `message`.
    return Promise.reject(new Error(userFriendlyMessage));
  }
);

export default api;