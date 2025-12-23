import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
// Importa le rotte
import authRoutes from './routes/auth';
import shiftRoutes from './routes/shifts';
import ServiceRequest from './models/ServiceRequest';
import UserRequestStatus from './models/UserRequestStatus';
import Service from './models/Service';
import { errorHandler } from './middleware/errorHandler';

import { startNotificationService } from './services/cron';
import { testConnection } from './db';

// Importa modelli per le associazioni
import './models/ServiceRequest';
import './models/UserRequestStatus';
import './models/Service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Avvia cron notifiche
startNotificationService();

// --- ROTTE API ---
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);

ServiceRequest.hasMany(UserRequestStatus, { foreignKey: 'request', as: 'notifications' });
UserRequestStatus.belongsTo(ServiceRequest, { foreignKey: 'request' });
ServiceRequest.belongsTo(Service, { foreignKey: 'service', targetKey: 'service_id' });

// --- GESTIONE ERRORI CENTRALIZZATA ---
// Deve essere l'ULTIMO middleware registrato
app.use(errorHandler);

// Test DB e Avvio Server
app.listen(PORT, async () => {
  console.log(`✅ Server avviato: http://localhost:${PORT}`);
  await testConnection();
});
