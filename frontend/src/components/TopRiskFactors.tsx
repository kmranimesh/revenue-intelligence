import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface RiskFactorsData {
    staleDeals: Array<{ dealId: string; accountName: string; daysOpen: number }>;
    underperformingReps: Array<{ name: string; winRate: number }>;
    lowActivityAccounts: Array<{ name: string }>;
}

function TopRiskFactors() {
    const [data, setData] = useState<RiskFactorsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/risk-factors')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Card sx={{ bgcolor: 'white', color: '#1a1f3c', height: '100%' }}>
                <CardContent>
                    <Skeleton variant="text" width={150} />
                    <Skeleton variant="rectangular" height={150} sx={{ mt: 2 }} />
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const risks = [
        {
            text: `${data.staleDeals.length} Enterprise deals stuck over 30 days`,
            color: '#f97316'
        },
        {
            text: data.underperformingReps[0] ? `Rep ${data.underperformingReps[0].name} - Win Rate: ${data.underperformingReps[0].winRate}%` : 'All reps performing well',
            color: '#f97316'
        },
        {
            text: `${data.lowActivityAccounts.length} Accounts with no recent activity`,
            color: '#f97316'
        }
    ];

    return (
        <Card sx={{ bgcolor: 'white', color: '#1a1f3c', height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Top Risk Factors</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {risks.map((risk, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <FiberManualRecordIcon sx={{ color: risk.color, fontSize: 12, mt: 0.7 }} />
                            <Typography variant="body1">{risk.text}</Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}

export default TopRiskFactors;
