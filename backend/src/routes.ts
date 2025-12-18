import { Router } from 'express';
import { login, updateDeviceToken, logout } from './controllers/authController';
import { getShifts, lockShift, acceptShift, refuseShift, completeShift } from './controllers/shiftController';
import { getProfile, updateProfile, deleteAccount } from './controllers/profileController';
import { verifyToken } from './middleware/auth'; 

const router = Router();

// --- AUTH ---
// Se il login funziona con questa riga, NON toccarla!
router.post('/auth/login', login); 

// FIX: Aggiungi '/auth' anche qui per far combaciare la richiesta del frontend
router.post('/auth/update-device', verifyToken, updateDeviceToken); 
router.post('/auth/logout', verifyToken, logout);

// --- PROFILE ---
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.delete('/profile', verifyToken, deleteAccount);

// --- SHIFTS ---
router.get('/shifts', verifyToken, getShifts);
router.get('/shifts', verifyToken, getShifts);
router.post('/shifts/:id/lock', verifyToken, lockShift);
router.post('/shifts/:id/accept', verifyToken, acceptShift);
router.post('/shifts/:id/refuse', verifyToken, refuseShift);
router.post('/shifts/:id/complete', verifyToken, completeShift);

export default router;