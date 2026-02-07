import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/database';
import summaryRoutes from './routes/summaryRoutes';
import driversRoutes from './routes/driversRoutes';
import riskFactorsRoutes from './routes/riskFactorsRoutes';
import recommendationsRoutes from './routes/recommendationsRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.use('/api', summaryRoutes);
app.use('/api', driversRoutes);
app.use('/api', riskFactorsRoutes);
app.use('/api', recommendationsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
