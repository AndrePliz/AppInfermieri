import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../db';
import Notification from '../models/Notification';
import UserRequestStatus from '../models/UserRequestStatus';
import axios from 'axios';

const DAY_MAP: { [key: number]: string } = {
  1: 'M', 2: 'T', 3: 'W', 4: 'H', 5: 'F', 6: 'S', 0: 'D',
};

export const NotificationLogic = {
  
  getRangeCode(hour: number): string {
    if (hour > 6 && hour < 14) return "6";
    else if (hour >= 14 && hour < 22) return "14";
    else return "22";
  },

  async findTargetsForRequest(request: any) {
    const reqDate = new Date(request.date_time);
    const dayChar = DAY_MAP[reqDate.getDay()];
    const hour = reqDate.getHours();
    const rangeCode = this.getRangeCode(hour);
    
    const availabilityToken = `${dayChar}${rangeCode}`; 

    let lat = 0;
    let lon = 0;

    if (request.positionRequest && request.positionRequest.coordinates) {
        lat = request.positionRequest.coordinates[0]; 
        lon = request.positionRequest.coordinates[1];
    } else if (request.latitude && request.longitude) {
        lat = request.latitude;
        lon = request.longitude;
    }

    if (!lat || !lon) return [];

    // --- LOGICA A BIVIO ---
    // Recuperiamo il tipo servizio dall'oggetto request (che include Service grazie al Cron)
    const serviceType = request.Service ? request.Service.type : 0;
    const serviceId = request.service;

    // 1. Base Query (Comune a tutti)
    let querySelect = `SELECT u.username, u.device FROM users u `;
    let queryJoin = `JOIN user_times_contactme utc ON utc.user = u.username `;
    
    // 2. SE NON È TIPO 8 (Azienda), AGGIUNGIAMO IL FILTRO COMPETENZE
    if (serviceType !== 8) {
        queryJoin += `JOIN user_services us ON us.user = u.username `;
    }

    // 3. Clausole Where base (Ruolo, Status, Orario, Distanza)
    let queryWhere = `
      WHERE (u.pharmacist = 0 OR u.pharmacist = 4)
      AND u.register_status = 2
      AND utc.days LIKE :dayPattern
      AND u.distance >= (
        3959 * acos (
          cos ( radians(:lat) )
          * cos( radians( X(position) ) )
          * cos( radians( Y(position) ) - radians(:lon) )
          + sin ( radians(:lat) )
          * sin( radians( X(position) ) )
        )
      )
    `;

    // 4. SE NON È TIPO 8, AGGIUNGIAMO IL FILTRO 'SELECTED = 1'
    if (serviceType !== 8) {
        queryWhere += ` AND us.service = :serviceId AND us.selected = '1' `;
    }

    // Uniamo i pezzi
    const finalQuery = querySelect + queryJoin + queryWhere;

    const candidates = await sequelize.query(finalQuery, {
      replacements: {
        lat: lat,
        lon: lon,
        dayPattern: `%${availabilityToken}%`,
        serviceId: serviceId // Serve solo se type != 8, ma passarlo sempre non fa danni
      },
      type: QueryTypes.SELECT
    });

    return candidates as { username: string, device: string }[];
  },

  async sendPushToTargets(requestId: number, message: string, targets: { username: string, device: string }[]) {
    const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
    const fixedTitle = "C'è una nuova richiesta nella tua zona!"; 
    
    if (!process.env.EXPO_ACCESS_TOKEN) {
      console.warn('[PUSH WARN] EXPO_ACCESS_TOKEN non è configurato. Le notifiche potrebbero non funzionare su build di sviluppo.');
    }

    const alreadySentPush = await Notification.findAll({ where: { request_id: requestId }, attributes: ['user'] });
    const sentPushUsers = new Set(alreadySentPush.map((n: any) => n.user));

    const alreadyAssigned = await UserRequestStatus.findAll({ where: { request: requestId }, attributes: ['user'] });
    const assignedUsers = new Set(alreadyAssigned.map((u: any) => u.user));

    const pushTargets = targets.filter(t => t.device && t.device.startsWith('ExponentPushToken') && !sentPushUsers.has(t.username));
    const dbTargets = targets.filter(t => !assignedUsers.has(t.username));

    if (pushTargets.length > 0) {
        const messages = pushTargets.map(t => ({
          to: t.device,
          sound: 'default',
          title: fixedTitle, 
          body: message, 
          data: { requestId: requestId, screen: 'Home' },
        }));

        try {
          const headers = { 
            'Accept': 'application/json', 
            'Accept-encoding': 'gzip, deflate', 
            'Content-Type': 'application/json',
            ...(process.env.EXPO_ACCESS_TOKEN && { 'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}` })
          };

          await axios.post(expoPushUrl, messages, { headers });
          
          const notificationsToInsert = pushTargets.map(t => ({
            user: t.username,
            request_id: requestId,
            title: fixedTitle, 
            message: message,
            data: JSON.stringify({ screen: 'Home' }),
            notification_type: 1,
            sent: 1,
            notification_date: new Date()
          }));
          // @ts-ignore
          await Notification.bulkCreate(notificationsToInsert);
          console.log(`[PUSH] Inviate ${pushTargets.length} notifiche`);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.error('[PUSH ERROR] Errore da Expo:', JSON.stringify(error.response.data, null, 2));
          } else {
            console.error('[PUSH ERROR]', error);
          }
        }
    }

    if (dbTargets.length > 0) {
        try {
            const rowsToInsert = dbTargets.map(t => ({
                user: t.username,
                request: requestId,
                status: 1, 
                sent_date: new Date(),
                sent_notification: 1, 
                sent_mail: 0 
            }));
            
            // @ts-ignore
            await UserRequestStatus.bulkCreate(rowsToInsert, { ignoreDuplicates: true });
            console.log(`[DB] Assegnate ${rowsToInsert.length} richieste in user_request_status`);
        } catch (e) {
            console.error('[DB INSERT ERROR]', e);
        }
    }
  }
};