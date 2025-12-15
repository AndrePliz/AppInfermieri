import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function inspect() {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || 5825;
  
  console.log(`Tentativo di connessione a ${host}:${port}...`);

  const sequelize = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USER!,
    process.env.DB_PASS!,
    {
      host: host,
      port: Number(port), // <--- QUI forziamo la porta 5825
      dialect: 'mysql',   // Stackhero usa MariaDB che è compatibile col driver mysql
      logging: false,
      dialectOptions: {
        // Stackhero richiede SSL sicuro
        ssl: {
          require: true,
          rejectUnauthorized: false // Accetta certificati self-signed se necessario
        },
        connectTimeout: 10000 // Aumentiamo il timeout per sicurezza
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log("✅ Connessione riuscita!");

    // 1. Lista tabelle
    const [results] = await sequelize.query("SHOW TABLES");
    console.log("\n--- TABELLE NEL DATABASE ---");
    const tableNames = results.map((r: any) => Object.values(r)[0]);
    console.log(tableNames);

    // 2. Cerca tabella utenti
    const userTable = tableNames.find((t: any) => 
        ['users', 'user', 'tbl_users', 'tbl_user', 'utenti', 'account'].includes(t as string)
    );

    if (userTable) {
        console.log(`\n--- TROVATA TABELLA UTENTI: ${userTable} ---`);
        // Prendiamo 1 utente per vedere la password
        const [users] = await sequelize.query(`SELECT * FROM ${userTable} LIMIT 1`);
        console.log("Esempio dati utente (Copia questo output per me):");
        console.log(users);
    } else {
        console.log("\n⚠️ Non ho trovato una tabella ovvia per gli utenti.");
    }

  } catch (error) {
    console.error("❌ Errore:", error);
  } finally {
    await sequelize.close();
  }
}

inspect();