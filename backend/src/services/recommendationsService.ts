import { db } from '../db/database';

export function getRecommendations() {
    const recommendations: Array<{ priority: string; category: string; action: string; impact: string }> = [];

    const staleEnterprise = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(d.amount), 0) as value
        FROM deals d JOIN accounts a ON d.account_id = a.account_id
        WHERE a.segment = 'Enterprise' AND d.stage IN ('Prospecting', 'Negotiation')
        AND julianday('2025-12-31') - julianday(d.created_at) > 30
    `).get() as { count: number; value: number };

    if (staleEnterprise.count > 0) {
        recommendations.push({
            priority: 'high', category: 'Pipeline',
            action: `Focus on ${staleEnterprise.count} Enterprise deals older than 30 days`,
            impact: `Potential value: $${Math.round(staleEnterprise.value).toLocaleString()}`
        });
    }

    const lowWinRateReps = db.prepare(`
        SELECT r.name, CAST(SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) AS FLOAT) / 
            NULLIF(SUM(CASE WHEN d.stage IN ('Closed Won', 'Closed Lost') THEN 1 ELSE 0 END), 0) * 100 as win_rate
        FROM reps r JOIN deals d ON r.rep_id = d.rep_id
        GROUP BY r.rep_id, r.name HAVING win_rate < 40 AND win_rate IS NOT NULL
    `).all() as Array<{ name: string; win_rate: number }>;
    if (lowWinRateReps.length > 0) {
        recommendations.push({
            priority: 'high', category: 'Coaching',
            action: `Coach ${lowWinRateReps.map(r => r.name).join(', ')} on win rate improvement`,
            impact: `Current win rates below 40%`
        });
    }

    const segmentOpp = db.prepare(`
        SELECT a.segment, COUNT(*) as pipeline_count, COALESCE(SUM(d.amount), 0) as pipeline_value
        FROM deals d JOIN accounts a ON d.account_id = a.account_id
        WHERE d.stage IN ('Prospecting', 'Negotiation')
        GROUP BY a.segment ORDER BY pipeline_value DESC
    `).all() as Array<{ segment: string; pipeline_count: number; pipeline_value: number }>;
    if (segmentOpp[0]) {
        recommendations.push({
            priority: 'medium', category: 'Focus',
            action: `Prioritize ${segmentOpp[0].segment} segment with ${segmentOpp[0].pipeline_count} active deals`,
            impact: `$${Math.round(segmentOpp[0].pipeline_value).toLocaleString()} in pipeline`
        });
    }

    const negotiationDeals = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as value FROM deals WHERE stage = 'Negotiation'
    `).get() as { count: number; value: number };
    if (negotiationDeals.count > 0) {
        recommendations.push({
            priority: 'high', category: 'Closing',
            action: `Push ${negotiationDeals.count} deals in Negotiation stage to close`,
            impact: `$${Math.round(negotiationDeals.value).toLocaleString()} ready to close`
        });
    }

    const inactiveCount = db.prepare(`
        SELECT COUNT(DISTINCT a.account_id) as count FROM accounts a
        JOIN deals d ON a.account_id = d.account_id
        LEFT JOIN activities act ON d.deal_id = act.deal_id
        WHERE d.stage IN ('Prospecting', 'Negotiation')
        GROUP BY a.account_id HAVING COUNT(act.activity_id) = 0
    `).all().length;
    if (inactiveCount > 0) {
        recommendations.push({
            priority: 'medium', category: 'Activity',
            action: `Increase outreach to ${inactiveCount} accounts with no recent activity`,
            impact: `Re-engage dormant opportunities`
        });
    }

    return { recommendations: recommendations.slice(0, 5) };
}
