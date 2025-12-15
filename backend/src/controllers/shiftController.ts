import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../db';
import ServiceRequest from '../models/ServiceRequest';
import UserRequestStatus from '../models/UserRequestStatus';
import Service from '../models/Service';

export const getShifts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.username; 

    // 1. DISPONIBILI (Nuove o In Visione)
    const available = await ServiceRequest.findAll({
      attributes: [
        'service_request_id', 'service', 'date_time', 'nurse_price', 
        'city', 'address', 'name', 'phone', 'notes', 'status_request', 'user_assigned', 'blocked_time'
      ],
      include: [
        {
            model: UserRequestStatus,
            as: 'notifications', 
            where: { 
                user: userId,
                status: { [Op.ne]: 4 } // Escludo le rifiutate
            },
            required: true 
        },
        {
            model: Service,
            attributes: ['service_id', 'service_description', 'service_description_detailed']
        }
      ],
      where: {
        [Op.or]: [
            { status_request: 1, date_time: { [Op.gte]: new Date() } }, 
            { status_request: 3, user_assigned: userId } 
        ]
      },
      order: [['date_time', 'ASC']]
    });

    // 2. DA ESEGUIRE (Solo assegnate, NO ESEGUITE)
    const myShifts = await ServiceRequest.findAll({
      include: [{ model: Service }],
      where: {
        user_assigned: userId,
        status_request: 2,
        date_time: { [Op.gte]: new Date() }
      },
      order: [['date_time', 'ASC']]
    });

    res.json({ available, myShifts });
  } catch (error) {
    console.error('Errore getShifts:', error);
    res.status(500).json({ message: 'Errore recupero turni' });
  }
};

// --- LOCK (Blocco temporaneo) ---
export const lockShift = async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const userId = (req as any).user.username;

        const request = await ServiceRequest.findByPk(id, { lock: true, transaction });

        if (!request) {
            await transaction.rollback();
            res.status(404).json({ message: 'Richiesta non trovata' });
            return;
        }

        // Controllo se è ancora libera
        if (request.status_request !== 1) {
            // Idempotenza: se è già bloccata da me, ok
            if (request.status_request === 3 && request.user_assigned === userId) {
                await transaction.rollback();
                res.json({ success: true, message: 'Già bloccata da te' });
                return;
            }
            await transaction.rollback();
            res.status(409).json({ message: 'Ops! Qualcun altro ha appena preso questa richiesta.' });
            return;
        }

        // Blocco
        request.status_request = 3; 
        request.user_assigned = userId;
        request.blocked_time = new Date(); 
        await request.save({ transaction });

        // Aggiorno stato utente a 3 (In visione)
        await UserRequestStatus.update(
            { status: 3 }, 
            { where: { request: id, user: userId }, transaction }
        );

        await transaction.commit();
        res.json({ success: true, message: 'Bloccata per 10 minuti' });

    } catch (error) {
        await transaction.rollback();
        console.error('Lock Error:', error);
        res.status(500).json({ message: 'Errore durante il blocco' });
    }
};

// --- ACCEPT (Conferma Definitiva) ---
export const acceptShift = async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const userId = (req as any).user.username;

        const request = await ServiceRequest.findByPk(id, { lock: true, transaction });

        if (!request) {
            await transaction.rollback();
            res.status(404).json({ message: 'Richiesta non trovata' });
            return;
        }

        // Deve essere in stato 3 (Locked) e assegnata a ME
        if (request.status_request !== 3 || request.user_assigned !== userId) {
            await transaction.rollback();
            res.status(400).json({ message: 'Tempo scaduto o richiesta non più disponibile.' });
            return;
        }

        // 1. Aggiorno Richiesta -> 2 (Assegnata)
        request.status_request = 2;
        // user_assigned resta userId (già settato nel lock)
        await request.save({ transaction });

        // 2. Aggiorno Tabella Utente -> 2 (Accettata)
        await UserRequestStatus.update(
            { status: 2 },
            { where: { request: id, user: userId }, transaction }
        );

        // NOTA: Non inviamo mail qui. Il Cron PHP legacy vedrà lo stato 2 e invierà le conferme.

        await transaction.commit();
        res.json({ success: true, message: 'Prestazione accettata con successo!' });

    } catch (error) {
        await transaction.rollback();
        console.error('Accept Error:', error);
        res.status(500).json({ message: 'Errore durante l\'accettazione' });
    }
};

// --- REFUSE (Rifiuto Manuale) ---
export const refuseShift = async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const userId = (req as any).user.username;

        const request = await ServiceRequest.findByPk(id, { lock: true, transaction });

        if (!request) {
            await transaction.rollback();
            res.status(404).json({ message: 'Richiesta non trovata' });
            return;
        }

        // Verifico che fosse bloccata da me (o anche se era 1, posso rifiutarla subito senza bloccarla prima?)
        // Per sicurezza, gestiamo il caso in cui l'utente stia rifiutando una richiesta che ha bloccato.
        if (request.user_assigned === userId && request.status_request === 3) {
            // Rilascio la richiesta per gli altri
            request.status_request = 1; // Torna libera
            request.user_assigned = null;
            request.blocked_time = null;
            await request.save({ transaction });
        }

        // Imposto il MIO stato a 4 (Rifiutata) così non la vedo più
        // Questo vale sia se l'avevo bloccata, sia se rifiuto direttamente dalla lista (se implementassimo quel tasto)
        await UserRequestStatus.update(
            { status: 4 },
            { where: { request: id, user: userId }, transaction }
        );

        await transaction.commit();
        res.json({ success: true, message: 'Richiesta rifiutata.' });

    } catch (error) {
        await transaction.rollback();
        console.error('Refuse Error:', error);
        res.status(500).json({ message: 'Errore durante il rifiuto' });
    }
};

// --- COMPLETE (Segnala Eseguita) ---
export const completeShift = async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const userId = (req as any).user.username;

        // 1. Cerco la richiesta
        const request = await ServiceRequest.findByPk(id, { lock: true, transaction });

        if (!request) {
            await transaction.rollback();
            res.status(404).json({ message: 'Richiesta non trovata' });
            return;
        }

        // 2. Controllo sicurezza: Deve essere assegnata a ME (Status 2)
        if (request.status_request !== 2 || request.user_assigned !== userId) {
            await transaction.rollback();
            res.status(400).json({ message: 'Non puoi completare questa richiesta (forse non è assegnata a te o è già chiusa).' });
            return;
        }

        // 3. Aggiorno Status -> 5 (Eseguita)
        request.status_request = 5;
        await request.save({ transaction });

        // 4. Aggiorno anche la tabella di notifica per coerenza
        await UserRequestStatus.update(
            { status: 5 },
            { where: { request: id, user: userId }, transaction }
        );

        await transaction.commit();
        res.json({ success: true, message: 'Ottimo lavoro! Prestazione registrata.' });

    } catch (error) {
        await transaction.rollback();
        console.error('Complete Error:', error);
        res.status(500).json({ message: 'Errore durante il completamento' });
    }
};