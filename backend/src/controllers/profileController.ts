import { Request, Response } from 'express';
import User from '../models/User';
import UserDevice from '../models/UserDevice'; 

// --- GET PROFILE ---
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Recuperiamo l'utente escludendo i campi sensibili
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'token'] } 
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
    // Estraiamo solo i campi che permettiamo di modificare
    const { name, phone, address, city, distance, notes } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Aggiorniamo i campi se presenti nella richiesta
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    // Gestione specifica per i numeri per evitare errori di tipo
    if (distance !== undefined) user.distance = parseInt(distance, 10);
    if (notes) user.notes = notes;

    await user.save();

    res.json({ success: true, message: 'Profilo aggiornato', user });

  } catch (error) {
    console.error('Errore update profilo:', error);
    res.status(500).json({ message: 'Errore durante aggiornamento' });
  }
};

// --- DELETE ACCOUNT ---
export const deleteAccount = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: 'Utente non trovato' });

        // Soft Delete / Anonimizzazione per mantenere integrità storico
        user.status = 0; // Disattivo (Status 0 = inattivo)
        user.account_blocked = 1;
        user.device = ''; // Rimuovi notifiche legacy
        
        // Anonimizza dati personali per GDPR
        user.username = `del_${userId}_${Date.now()}`; 
        
        await user.save();

        // Rimuovi device per non mandare più notifiche (usando la tabella nuova)
        await UserDevice.destroy({ where: { user_id: userId } });

        res.json({ message: 'Account eliminato con successo.' });

    } catch (error) {
        console.error('Errore eliminazione account:', error);
        res.status(500).json({ message: 'Errore server durante eliminazione' });
    }
};