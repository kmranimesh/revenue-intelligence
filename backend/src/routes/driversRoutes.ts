import { Router, Request, Response } from 'express';
import { getDrivers } from '../services/driversService';

const router = Router();

router.get('/drivers', (req: Request, res: Response) => {
    try {
        const drivers = getDrivers();
        res.json(drivers);
    } catch (error) {
        console.error('Error in /api/drivers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
