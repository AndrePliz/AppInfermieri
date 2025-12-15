import { Router } from 'express';
import { getShifts, lockShift, acceptShift, refuseShift, completeShift } from '../controllers/shiftController'; 
import { verifyToken } from '../middleware/auth'; 

const router = Router();

router.use(verifyToken);

router.get('/', getShifts);
router.post('/:id/lock', lockShift);
router.post('/:id/accept', acceptShift);
router.post('/:id/refuse', refuseShift);
router.post('/:id/complete', completeShift);

export default router;