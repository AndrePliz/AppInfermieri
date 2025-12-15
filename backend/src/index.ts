import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import shiftRoutes from './routes/shifts'; // <--- IMPORTA IL FILE ROTTE
import ServiceRequest from './models/ServiceRequest';
import UserRequestStatus from './models/UserRequestStatus';
import Service from './models/Service';
import { testConnection } from './db';
import { startNotificationService } from './services/cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
startNotificationService();

// Rotte API
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);

// Definisci le relazioni (Join)
ServiceRequest.hasMany(UserRequestStatus, { foreignKey: 'request', as: 'notifications' });
UserRequestStatus.belongsTo(ServiceRequest, { foreignKey: 'request' });
ServiceRequest.belongsTo(Service, { foreignKey: 'service', targetKey: 'service_id' });

// Avvio
app.listen(PORT, async () => {
  console.log(`✅ Server avviato: http://localhost:${PORT}`);
  await testConnection(); // Testa la connessione all'avvio
});