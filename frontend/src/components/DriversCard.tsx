import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, LinearProgress } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface DriversData {
    pipeline: { count: number; value: number };
    winRate: number;
    averageDealSize: number;
    salesCycleTime: number;
    bySegment: Array<{ segment: string; dealCount: number; totalValue: number; winRate: number }>;
}

function DriversCard() {
    const [data, setData] = useState<DriversData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/drivers')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching drivers:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const metrics = [
        { icon: <ShowChartIcon />, label: 'Pipeline', value: formatCurrency(data.pipeline.value), sub: `${data.pipeline.count} deals` },
        { icon: <SpeedIcon />, label: 'Win Rate', value: `${data.winRate}%`, sub: 'Overall' },
        { icon: <AttachMoneyIcon />, label: 'Avg Deal Size', value: formatCurrency(data.averageDealSize), sub: 'Closed Won' },
        { icon: <AccessTimeIcon />, label: 'Sales Cycle', value: `${data.salesCycleTime} days`, sub: 'Average' },
    ];

    return (
        <Card sx={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Performance Drivers</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    {metrics.map((metric, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: 'primary.main' }}>{metric.icon}</Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">{metric.label}</Typography>
                                <Typography variant="h6" fontWeight="bold">{metric.value}</Typography>
                                <Typography variant="caption" color="text.secondary">{metric.sub}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>By Segment</Typography>
                {data.bySegment.map((segment) => (
                    <Box key={segment.segment} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{segment.segment}</Typography>
                            <Typography variant="body2">{segment.winRate}% win rate</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={segment.winRate}
                            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)' }}
                        />
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}

export default DriversCard;
