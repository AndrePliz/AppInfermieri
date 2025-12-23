import { Request, Response, NextFunction } from 'express';

/**
 * Middleware di gestione degli errori centralizzato.
 * Cattura tutti gli errori che si verificano nei controller asincroni
 * e restituisce una risposta di errore standard.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Logga l'errore completo nel terminale per il debug
  // In un'applicazione di produzione, potresti voler usare un logger più avanzato (es. Winston)
  console.error(`❌ ERRORE NON GESTITO: ${err.stack}`);

  // Imposta un codice di stato di default
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Invia una risposta di errore generica al client per non esporre dettagli implementativi
  res.status(statusCode).json({
    message: 'Si è verificato un errore interno del server.',
    // Includi lo stack trace solo in ambiente di sviluppo
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};