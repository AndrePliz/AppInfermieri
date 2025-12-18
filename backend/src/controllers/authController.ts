import { Request, Response } from 'express';
import User from '../models/User';
import UserDevice from '../models/UserDevice';
import crypto from 'crypto'; 
import jwt from 'jsonwebtoken';
import { Platform } from 'react-native'; // Nota: Non usiamo react-native nel backend, ma è solo per capire la logica. Platform va passata dal body.

const md5 = (str: string) => crypto.createHash('md5').update(str).digest('hex');

// --- LOGIN ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, pushToken, platform } = req.body; 

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

    // GESTIONE MULTI-DEVICE: Inseriamo il token nella tabella dedicata
    if (pushToken && pushToken.startsWith('ExponentPushToken')) {
        // Rimuoviamo eventuali vecchi record con lo stesso token per evitare duplicati
        await UserDevice.destroy({ where: { device_token: pushToken } });

        // Creiamo il nuovo record
        await UserDevice.create({
            user_id: user.id,
            device_token: pushToken,
            platform: platform || 'unknown',
            last_seen: new Date()
        });

        // Manteniamo retrocompatibilità aggiornando anche il vecchio campo 'device' per ora
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
    const { device, platform } = req.body;
    
    // Il middleware 'authenticateToken' decodifica il token e mette i dati in req.user
    // Nel login abbiamo salvato l'ID come 'id', quindi lo recuperiamo così:
    const userId = req.user.id; 

    if (!device) {
      return res.status(400).json({ message: 'Token mancante' });
    }

    // Multi-Device: Aggiorniamo/Inseriamo nella tabella user_devices
    const existingDevice = await UserDevice.findOne({ where: { device_token: device } });

    if (existingDevice) {
        // Se il device esiste già ma appartiene a un altro user (caso raro ma possibile), lo aggiorniamo
        existingDevice.user_id = userId;
        existingDevice.last_seen = new Date();
        if (platform) existingDevice.platform = platform;
        await existingDevice.save();
    } else {
        // Nuovo device
        await UserDevice.create({
            user_id: userId,
            device_token: device,
            platform: platform || 'unknown',
            last_seen: new Date()
        });
    }

    // Retrocompatibilità
    const user = await User.findByPk(userId);
    if (user) {
        user.device = device;
        await user.save();
    }

    console.log(`📱 Token Multi-Device aggiornato per User ID ${userId}: ${device}`);
    res.json({ message: 'Device token aggiornato correttamente' });

  } catch (error) {
    console.error('Errore aggiornamento token:', error);
    res.status(500).json({ message: 'Errore server' });
  }
};

// --- LOGOUT ---
export const logout = async (req: any, res: Response) => {
    try {
        const { device } = req.body;
        const userId = req.user.id;

        if (device) {
            // Rimuoviamo SOLO il device specifico da cui si sta facendo logout
            await UserDevice.destroy({
                where: {
                    user_id: userId,
                    device_token: device
                }
            });
            console.log(`🚪 Logout: Rimosso device ${device} per user ${userId}`);
        } else {
             console.log(`⚠️ Logout richiesto senza device token. Impossibile rimuovere notifica.`);
        }

        res.json({ message: 'Logout effettuato' });
    } catch (error) {
        console.error('Errore durante il logout:', error);
        res.status(500).json({ message: 'Errore server' });
    }
};