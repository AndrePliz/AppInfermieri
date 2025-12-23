import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const md5 = (str: string) => crypto.createHash('md5').update(str).digest('hex');

// --- LOGIN ---
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, pushToken } = req.body;

  // LOG PER DEBUGGARE (Rimuovi in produzione)
  console.log(`🔍 LOGIN INIT: User=${username}`);

  if (!username || !password) {
    res.status(400).json({ message: 'Username e password richiesti' });
    return;
  }

  // 1. Cerca utente
  const user = await User.findOne({ where: { username: username } });

  if (!user) {
    console.log('❌ Utente non trovato');
    res.status(401).json({ message: 'Credenziali non valide' });
    return;
  }

  // 2. Controllo se è infermiere
  if (user.pharmacist !== 0) {
    console.log(`❌ Ruolo errato: pharmacist=${user.pharmacist}`);
    res.status(401).json({ message: 'Accesso consentito solo agli infermieri' });
    return;
  }

  // 3. Verifica Hash Password MD5
  const inputHash = md5(password);
  if (inputHash !== user.password) {
    console.log(`❌ Password errata. DB=${user.password} Input=${inputHash}`);

    // Gestione contatore tentativi
    user.login_counter = (user.login_counter || 0) + 1;
    if (user.login_counter >= 5) {
      user.account_blocked = 1;
      await user.save();
      res.status(403).json({ message: 'Account bloccato per troppi tentativi.' });
      return;
    }
    await user.save();

    res.status(401).json({ message: 'Credenziali non valide' });
    return;
  }

  // 4. Login OK
  if (user.account_blocked === 1) {
    res.status(403).json({ message: 'Account bloccato.' });
    return;
  }

  // Reset contatore
  user.login_counter = 0;

  // Salva Push Token se presente
  if (pushToken && pushToken.startsWith('ExponentPushToken')) {
    user.device = pushToken;
  }

  await user.save();

  // 5. Genera Token JWT
  const token = jwt.sign(
    { id: user.id, username: user.username, role: 'nurse' },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  console.log('✅ LOGIN SUCCESSO');

  // 6. Risposta al Client
  res.json({
    message: 'Login effettuato',
    token: token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      mail: user.mail,
      pharmacist: user.pharmacist,
    },
  });
});

// --- UPDATE DEVICE TOKEN ---
export const updateDeviceToken = asyncHandler(async (req: any, res: Response) => {
  const { device } = req.body;
  const userId = req.user.id;

  if (!device) {
    res.status(400).json({ message: 'Token mancante' });
    return;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404).json({ message: 'Utente non trovato' });
    return;
  }

  user.device = device;
  await user.save();

  res.json({ message: 'Device token aggiornato' });
});