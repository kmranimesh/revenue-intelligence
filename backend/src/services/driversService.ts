import { db } from '../db/database';

export function getDrivers() {
    const pipelineResult = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as value
        FROM deals WHERE stage IN ('Prospecting', 'Negotiation')
    `).get() as { count: number; value: number };
    const winLossResult = db.prepare(`
        SELECT 
            SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost
        FROM deals WHERE stage IN ('Closed Won', 'Closed Lost')
    `).get() as { won: number; lost: number };
    const totalClosed = winLossResult.won + winLossResult.lost;
    const winRate = totalClosed > 0 ? (winLossResult.won / totalClosed) * 100 : 0;
    const avgDealResult = db.prepare(`
        SELECT COALESCE(AVG(amount), 0) as avg_amount
        FROM deals WHERE stage = 'Closed Won' AND amount IS NOT NULL
    `).get() as { avg_amount: number }; 
    const cycleTimeResult = db.prepare(`
        SELECT AVG(julianday(closed_at) - julianday(created_at)) as avg_days
        FROM deals WHERE stage = 'Closed Won' AND closed_at IS NOT NULL AND created_at IS NOT NULL
    `).get() as { avg_days: number };
    const segmentAnalysis = db.prepare(`
        SELECT a.segment, COUNT(*) as deal_count, COALESCE(SUM(d.amount), 0) as total_value,
            SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN d.stage IN ('Closed Won', 'Closed Lost') THEN 1 ELSE 0 END) as closed
        FROM deals d JOIN accounts a ON d.account_id = a.account_id GROUP BY a.segment
    `).all() as Array<{ segment: string; deal_count: number; total_value: number; won: number; closed: number }>;

    return {
        pipeline: { count: pipelineResult.count, value: Math.round(pipelineResult.value) },
        winRate: Math.round(winRate * 100) / 100,
        averageDealSize: Math.round(avgDealResult.avg_amount),
        salesCycleTime: Math.round(cycleTimeResult.avg_days || 0),
        bySegment: segmentAnalysis.map(s => ({
            segment: s.segment,
            dealCount: s.deal_count,
            totalValue: Math.round(s.total_value),
            winRate: s.closed > 0 ? Math.round((s.won / s.closed) * 100) : 0
        }))
    };
}
