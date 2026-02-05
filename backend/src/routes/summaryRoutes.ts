import { Router, Request, Response } from 'express';
import { getSummary } from '../services/summaryService';

const router = Router();

router.get('/summary', (req: Request, res: Response) => {
    try {
        const summary = getSummary();
        res.json(summary);
    } catch (error) {
        console.error('Error in /api/summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
