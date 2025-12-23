/**
 * File di configurazione centrale per l'applicazione mobile.
 *
 * Contiene le variabili che cambiano in base all'ambiente (sviluppo, produzione).
 * Per ora, usiamo valori statici per lo sviluppo. In futuro, questo file
 * potrà essere esteso per leggere da variabili d'ambiente.
 */

// NOTA PER IL FUTURO: Quando avrai il server di produzione,
// dovrai aggiornare questo indirizzo con l'URL pubblico (es. https://api.pharmacare.it/api)
// e assicurarti che usi HTTPS.
const API_URL = 'http://192.168.2.123:3000/api';

export const config = {
  API_URL,
};