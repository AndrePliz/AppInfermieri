import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendiamo l'interfaccia Request per includere l'user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Il token arriva nell'header come "Bearer eyJhbGci..."
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // IMPORTANTE: return per fermare l'esecuzione
    res.status(401).json({ message: 'Accesso negato. Manca il token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // Iniettiamo i dati utente nella richiesta
    next(); // Passiamo al prossimo step (il controller)
  } catch (error) {
    res.status(400).json({ message: 'Token non valido o scaduto.' });
  }
};