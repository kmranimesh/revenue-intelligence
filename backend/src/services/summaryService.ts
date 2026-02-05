import { db } from '../db/database';

function getCurrentQuarterInfo() {
    const currentYear = 2025;
    const currentQuarter: number = 4;
    const quarterMonths: { [key: number]: string[] } = {
        1: ['01', '02', '03'],
        2: ['04', '05', '06'],
        3: ['07', '08', '09'],
        4: ['10', '11', '12']
    };
    const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const prevYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
    return {
        year: currentYear,
        quarter: currentQuarter,
        months: quarterMonths[currentQuarter].map(m => `${currentYear}-${m}`),
        prevQuarterMonths: quarterMonths[prevQuarter].map(m => `${prevYear}-${m}`)
    };
}

export function getSummary() {
    const { months, prevQuarterMonths } = getCurrentQuarterInfo();
    const currentRevenue = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as revenue
        FROM deals 
        WHERE stage = 'Closed Won' 
        AND substr(closed_at, 1, 7) IN (${months.map(() => '?').join(',')})
    `).get(...months) as { revenue: number };
    const prevRevenue = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as revenue
        FROM deals 
        WHERE stage = 'Closed Won' 
        AND substr(closed_at, 1, 7) IN (${prevQuarterMonths.map(() => '?').join(',')})
    `).get(...prevQuarterMonths) as { revenue: number };
    const targetResult = db.prepare(`
        SELECT COALESCE(SUM(target), 0) as total_target
        FROM targets 
        WHERE month IN (${months.map(() => '?').join(',')})
    `).get(...months) as { total_target: number };
    const revenue = currentRevenue.revenue || 0;
    const target = targetResult.total_target || 0;
    const gap = target > 0 ? ((revenue - target) / target) * 100 : 0;
    const prevRev = prevRevenue.revenue || 0;
    const qoqChange = prevRev > 0 ? ((revenue - prevRev) / prevRev) * 100 : 0;
    return {
        currentQuarterRevenue: Math.round(revenue),
        target: Math.round(target),
        gap: Math.round(gap * 100) / 100,
        qoqChange: Math.round(qoqChange * 100) / 100,
        status: gap >= 0 ? 'ahead' : 'behind'
    };
}
