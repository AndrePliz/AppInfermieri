import { Request, Response } from 'express';
import User from '../models/User';
import crypto from 'crypto'; 
import jwt from 'jsonwebtoken';

const md5 = (str: string) => crypto.createHash('md5').update(str).digest('hex');

// --- LOGIN ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, pushToken } = req.body; 

    if (!username || !password) {
      res.status(400).json({ message: 'Username e password richiesti' });
      return;
    }

    const user = await User.findOne({ where: { username: username, pharmacist: 0 } });

    if (!user) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    if (user.account_blocked === 1) {
      res.status(403).json({ message: 'Account bloccato.' });
      return;
    }

    const inputHash = md5(password);

    if (inputHash !== user.password) {
      user.login_counter += 1;
      if (user.login_counter >= 5) {
        user.account_blocked = 1;
        await user.save();
        res.status(403).json({ message: 'Account bloccato.' });
        return;
      }
      await user.save();
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    // Login Successo: Resetta contatore
    if (user.login_counter > 0) {
        user.login_counter = 0;
    }

    // AGGIORNAMENTO TOKEN PUSH (Se passato direttamente al login)
    if (pushToken && pushToken.startsWith('ExponentPushToken')) {
        user.device = pushToken;
    }
    
    await user.save();

    // Creazione Token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'nurse' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login effettuato',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email_notifiche: user.mail,
        pharmacist: user.pharmacist
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// --- NUOVA FUNZIONE CORRETTA: UPDATE DEVICE TOKEN ---
export const updateDeviceToken = async (req: any, res: Response) => {
  try {
    console.log("=================================");
    console.log("📨 RICHIESTA ARRIVATA AL CONTROLLER");
    console.log("🔑 Headers:", req.headers['content-type']);
    console.log("📦 Body ricevuto:", JSON.stringify(req.body, null, 2));
    console.log("📱 Cerco la chiave 'device'. Valore:", req.body?.device);
    console.log("=================================");
    const { device } = req.body;
    
    // Il middleware 'authenticateToken' decodifica il token e mette i dati in req.user
    // Nel login abbiamo salvato l'ID come 'id', quindi lo recuperiamo così:
    const userId = req.user.id; 

    if (!device) {
      return res.status(400).json({ message: 'Token mancante' });
    }

    // Usiamo Sequelize invece di db.execute per coerenza
    const user = await User.findByPk(userId);

    if (!user) {
        return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Aggiorniamo il campo device
    user.device = device;
    await user.save();

    console.log(`📱 Token aggiornato per User ID ${userId}: ${device}`);
    res.json({ message: 'Device token aggiornato correttamente' });

  } catch (error) {
    console.error('Errore aggiornamento token:', error);
    res.status(500).json({ message: 'Errore server' });
  }
};