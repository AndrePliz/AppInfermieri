import { Request, Response } from 'express';
import User from '../models/User';

// --- GET PROFILE ---
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'token'] } // Non restituiamo password o token vecchi
    });

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json(user);
  } catch (error) {
    console.error('Errore recupero profilo:', error);
    res.status(500).json({ message: 'Errore server' });
  }
};

// --- UPDATE PROFILE ---
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { 
        name, 
        phone, 
        address, 
        city, 
        distance, 
        iban, // Se serve in futuro
        notes 
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Aggiorniamo solo i campi permessi
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (distance) user.distance = distance; // Raggio KM
    if (notes) user.notes = notes;

    await user.save();

    res.json({ message: 'Profilo aggiornato con successo', user });
  } catch (error) {
    console.error('Errore aggiornamento profilo:', error);
    res.status(500).json({ message: 'Errore server' });
  }
};

// --- DELETE ACCOUNT (CRITICO PER APPLE) ---
export const deleteAccount = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Anonimizzazione o Eliminazione Soft (Dipende dalle policy aziendali)
        // Per ora facciamo una soft delete disattivando l'account e rimuovendo i dati sensibili
        // Oppure una delete fisica se richiesto strettamente.
        // Qui optiamo per: Cambiare status = 0 (Disattivo) e cancellare dati sensibili.
        
        user.status = 0;
        user.account_blocked = 1;
        user.device = ''; // Rimuovi notifiche
        user.mail = `deleted_${userId}@deleted.com`; // Rimuovi email reale per evitare login
        user.phone = null;
        user.username = `deleted_${userId}`; // Libera username
        
        await user.save();

        // Rimuovi anche tutti i device associati
        // (Nota: Importazione UserDevice circolare evitata usando query raw o importando sopra se necessario, 
        // ma qui user.save() ha già tolto il device legacy. Per user_devices servirebbe importarlo.)
        const { UserDevice } = require('../models/UserDevice'); // Lazy import per evitare cicli se presenti
        if (UserDevice) {
             await UserDevice.destroy({ where: { user_id: userId } });
        }

        res.json({ message: 'Account eliminato con successo.' });

    } catch (error) {
        console.error('Errore eliminazione account:', error);
        res.status(500).json({ message: 'Errore server durante eliminazione account' });
    }
};
