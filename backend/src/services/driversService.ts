import { db } from '../db/database';

function getQuarterMetrics(year: number, quarter: number) {
    const quarterMonths: { [key: number]: string[] } = {
        1: ['01', '02', '03'], 2: ['04', '05', '06'],
        3: ['07', '08', '09'], 4: ['10', '11', '12']
    };
    const months = quarterMonths[quarter].map(m => `${year}-${m}`);
    const monthPattern = months.map(m => `'${m}%'`).join(' OR closed_at LIKE ');

    const pipelineResult = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as value
        FROM deals WHERE stage IN ('Prospecting', 'Negotiation')
    `).get() as { count: number; value: number };

    const winLossResult = db.prepare(`
        SELECT SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
               SUM(CASE WHEN stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost
        FROM deals WHERE stage IN ('Closed Won', 'Closed Lost') 
        AND (closed_at LIKE ${monthPattern})
    `).get() as { won: number; lost: number };

    const totalClosed = (winLossResult.won || 0) + (winLossResult.lost || 0);
    const winRate = totalClosed > 0 ? ((winLossResult.won || 0) / totalClosed) * 100 : 0;

    const avgDealResult = db.prepare(`
        SELECT COALESCE(AVG(amount), 0) as avg_amount
        FROM deals WHERE stage = 'Closed Won' AND amount IS NOT NULL
        AND (closed_at LIKE ${monthPattern})
    `).get() as { avg_amount: number };

    const cycleTimeResult = db.prepare(`
        SELECT AVG(julianday(closed_at) - julianday(created_at)) as avg_days
        FROM deals WHERE stage = 'Closed Won' AND closed_at IS NOT NULL
        AND (closed_at LIKE ${monthPattern})
    `).get() as { avg_days: number };

    return { pipelineValue: pipelineResult.value, winRate, avgDeal: avgDealResult.avg_amount, cycleTime: cycleTimeResult.avg_days || 0 };
}

export function getDrivers() {
    const pipelineResult = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as value
        FROM deals WHERE stage IN ('Prospecting', 'Negotiation')
    `).get() as { count: number; value: number };

    const winLossResult = db.prepare(`
        SELECT SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
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
        FROM deals WHERE stage = 'Closed Won' AND closed_at IS NOT NULL
    `).get() as { avg_days: number };

    // Q4 vs Q3 comparison
    const q4 = getQuarterMetrics(2025, 4);
    const q3 = getQuarterMetrics(2025, 3);

    const calcChange = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const segmentAnalysis = db.prepare(`
        SELECT a.segment, COUNT(*) as deal_count, COALESCE(SUM(d.amount), 0) as total_value,
            SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN d.stage IN ('Closed Won', 'Closed Lost') THEN 1 ELSE 0 END) as closed,
            COALESCE(AVG(CASE WHEN d.stage = 'Closed Won' THEN d.amount END), 0) as avg_deal,
            COALESCE(AVG(CASE WHEN d.stage = 'Closed Won' THEN julianday(d.closed_at) - julianday(d.created_at) END), 0) as avg_cycle
        FROM deals d JOIN accounts a ON d.account_id = a.account_id GROUP BY a.segment
        ORDER BY a.segment
    `).all() as Array<{ segment: string; deal_count: number; total_value: number; won: number; closed: number; avg_deal: number; avg_cycle: number }>;

    const monthlyTrends = db.prepare(`
        SELECT 
            strftime('%Y-%m', closed_at) as month,
            COUNT(*) as deals,
            COALESCE(SUM(amount), 0) as revenue,
            SUM(CASE WHEN stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN stage IN ('Closed Won', 'Closed Lost') THEN 1 ELSE 0 END) as closed,
            COALESCE(AVG(CASE WHEN stage = 'Closed Won' THEN amount END), 0) as avg_deal,
            COALESCE(AVG(CASE WHEN stage = 'Closed Won' THEN julianday(closed_at) - julianday(created_at) END), 0) as cycle_time
        FROM deals 
        WHERE closed_at IS NOT NULL
        GROUP BY strftime('%Y-%m', closed_at)
        ORDER BY month DESC
        LIMIT 12
    `).all() as Array<{ month: string; deals: number; revenue: number; won: number; closed: number; avg_deal: number; cycle_time: number }>;

    return {
        pipeline: { count: pipelineResult.count, value: Math.round(pipelineResult.value) },
        pipelineChange: calcChange(q4.pipelineValue, q3.pipelineValue),
        winRate: Math.round(winRate * 100) / 100,
        winRateChange: Math.round((q4.winRate - q3.winRate) * 100) / 100,
        averageDealSize: Math.round(avgDealResult.avg_amount),
        avgDealChange: calcChange(q4.avgDeal, q3.avgDeal),
        salesCycleTime: Math.round(cycleTimeResult.avg_days || 0),
        cycleTimeChange: Math.round((q4.cycleTime - q3.cycleTime) || 0),
        bySegment: segmentAnalysis.map(s => ({
            segment: s.segment,
            dealCount: s.deal_count,
            totalValue: Math.round(s.total_value),
            winRate: s.closed > 0 ? Math.round((s.won / s.closed) * 100) : 0,
            avgDeal: Math.round(s.avg_deal),
            avgCycle: Math.round(s.avg_cycle)
        })),
        monthlyTrends: monthlyTrends.reverse().map(m => ({
            month: m.month,
            revenue: Math.round(m.revenue),
            winRate: m.closed > 0 ? Math.round((m.won / m.closed) * 100) : 0,
            avgDeal: Math.round(m.avg_deal),
            cycleTime: Math.round(m.cycle_time)
        }))
    };
}
