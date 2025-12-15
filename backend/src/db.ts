import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Debug per vedere se legge le variabili (non stampa la password per sicurezza)
console.log(`🔌 Tentativo connessione DB: Host=${process.env.DB_HOST}, Port=${process.env.DB_PORT || 5825}`);

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST,
    // CRITICO: Forziamo la porta 5825 come nel test
    port: Number(process.env.DB_PORT || 5825),
    dialect: 'mysql',
    logging: false, // Metti 'console.log' se vuoi vedere le query SQL nel terminale
    dialectOptions: {
      // CRITICO: Configurazione SSL per Stackhero/Heroku
      ssl: {
        require: true,
        rejectUnauthorized: false 
      },
      connectTimeout: 20000 // 20 secondi prima di dare timeout
    },
    // Configurazioni pool per stabilità
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DATABASE CONNESSO CORRETTAMENTE (Main App)');
    } catch (error) {
        console.error('❌ ERRORE FATALE CONNESSIONE DB:', error);
    }
};