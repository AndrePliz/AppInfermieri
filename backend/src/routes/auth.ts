import { Router } from 'express';
import { login, updateDeviceToken } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Diventa: /api/auth/login
router.post('/login', login); 

// Diventa: /api/auth/update-device
router.post('/update-device', verifyToken, updateDeviceToken); 

export default router;