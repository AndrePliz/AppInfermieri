import cron from 'node-cron';
import ServiceRequest from '../models/ServiceRequest';
import Service from '../models/Service';
import UserRequestStatus from '../models/UserRequestStatus';
import { NotificationLogic } from './notificationLogic';
import { Op, literal } from 'sequelize'; // <--- Importa 'literal'

export const startNotificationService = () => {
  console.log('🚀 Notification Service avviato (Check ogni 60s)...');

  cron.schedule('* * * * *', async () => {
    try {
      // ===========================================
      // 1. PULIZIA LOCK SCADUTI (> 10 MIN)
      // ===========================================
      // Cerchiamo richieste in status 3 (In Visione) il cui blocked_time è vecchio
      const expiredLocks = await ServiceRequest.findAll({
        where: {
          status_request: 3,
          blocked_time: {
            // "blocked_time < NOW() - 10 minuti"
            [Op.lt]: literal("DATE_SUB(NOW(), INTERVAL 10 MINUTE)")
          }
        }
      });

      if (expiredLocks.length > 0) {
        console.log(`[CRON] Trovati ${expiredLocks.length} lock scaduti. Rilascio...`);
        
        for (const req of expiredLocks) {
          // A. Reset Richiesta
          req.status_request = 1; // Torna libera
          req.user_assigned = null; // Nessuno assegnato
          req.blocked_time = null; // Rimuovi timer
          await req.save();

          // B. Reset Assegnazione in user_request_status
          // Dobbiamo dire che l'utente non la sta più visionando (status 1 = proposta)
          // Attenzione: cerchiamo la riga per quell'utente e quella richiesta
          if (req.user_assigned) { // (Anche se l'abbiamo appena messo null sopra, usiamo il valore vecchio se l'avessimo salvato, o facciamo query generica)
             // Meglio fare un update massivo per sicurezza su questa request
             await UserRequestStatus.update(
                { status: 1 }, // Torna status "Proposta"
                { where: { request: req.service_request_id, status: 3 } }
             );
          }
        }
      }

      // ===========================================
      // 2. INVIO NOTIFICHE NUOVE RICHIESTE
      // ===========================================
      const activeRequests = await ServiceRequest.findAll({
        where: {
          status_request: 1, 
          date_time: { [Op.gt]: new Date() },
        },
        include: [Service],
        limit: 20
      });

      for (const req of activeRequests) {
        const requestData = req.toJSON(); 
        const targets = await NotificationLogic.findTargetsForRequest(requestData);
        
        if (targets.length > 0) {
          const serviceName = requestData.Service?.service_description || 'Nuova prestazione';
          await NotificationLogic.sendPushToTargets(
            req.service_request_id,
            serviceName, 
            targets
          );
        }
      }

    } catch (error) {
      console.error('Errore nel Cron Notifiche:', error);
    }
  });
};