import { db } from '../db/database';

export function getRiskFactors() {
    const staleDeals = db.prepare(`
        SELECT d.deal_id, d.account_id, a.name as account_name, r.name as rep_name,
            d.stage, d.amount, d.created_at,
            julianday('2025-12-31') - julianday(d.created_at) as days_open,
            (SELECT MAX(timestamp) FROM activities WHERE deal_id = d.deal_id) as last_activity
        FROM deals d
        JOIN accounts a ON d.account_id = a.account_id
        JOIN reps r ON d.rep_id = r.rep_id
        WHERE d.stage IN ('Prospecting', 'Negotiation')
        AND julianday('2025-12-31') - julianday(d.created_at) > 30
        ORDER BY days_open DESC LIMIT 10
    `).all() as Array<any>;

    const repPerformance = db.prepare(`
        SELECT r.rep_id, r.name, COUNT(*) as total_deals,
            SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN d.stage IN ('Closed Won', 'Closed Lost') THEN 1 ELSE 0 END) as closed,
            COALESCE(SUM(CASE WHEN d.stage = 'Closed Won' THEN d.amount ELSE 0 END), 0) as revenue
        FROM reps r LEFT JOIN deals d ON r.rep_id = d.rep_id
        GROUP BY r.rep_id, r.name HAVING closed > 0
    `).all() as Array<{ rep_id: string; name: string; total_deals: number; won: number; closed: number; revenue: number }>;

    const avgWinRate = repPerformance.reduce((sum, r) => sum + (r.won / r.closed), 0) / repPerformance.length;
    const underperformingReps = repPerformance
        .filter(r => (r.won / r.closed) < avgWinRate)
        .map(r => ({
            repId: r.rep_id, name: r.name,
            winRate: Math.round((r.won / r.closed) * 100),
            avgWinRate: Math.round(avgWinRate * 100),
            totalDeals: r.total_deals, revenue: Math.round(r.revenue)
        }));

    const lowActivityAccounts = db.prepare(`
        SELECT a.account_id, a.name, a.segment, COUNT(DISTINCT d.deal_id) as deal_count,
            COUNT(DISTINCT act.activity_id) as activity_count, COALESCE(SUM(d.amount), 0) as potential_value
        FROM accounts a
        JOIN deals d ON a.account_id = d.account_id
        LEFT JOIN activities act ON d.deal_id = act.deal_id
        WHERE d.stage IN ('Prospecting', 'Negotiation')
        GROUP BY a.account_id, a.name, a.segment
        HAVING activity_count < 3 ORDER BY potential_value DESC LIMIT 10
    `).all() as Array<any>;

    return {
        staleDeals: staleDeals.map(d => ({
            dealId: d.deal_id, accountName: d.account_name, repName: d.rep_name,
            stage: d.stage, amount: d.amount, daysOpen: Math.round(d.days_open), lastActivity: d.last_activity
        })),
        underperformingReps,
        lowActivityAccounts: lowActivityAccounts.map(a => ({
            accountId: a.account_id, name: a.name, segment: a.segment,
            dealCount: a.deal_count, activityCount: a.activity_count, potentialValue: Math.round(a.potential_value)
        }))
    };
}
