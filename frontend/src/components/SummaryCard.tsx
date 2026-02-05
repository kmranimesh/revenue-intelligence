import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface SummaryData {
    currentQuarterRevenue: number;
    target: number;
    gap: number;
    qoqChange: number;
    status: 'ahead' | 'behind';
}

function SummaryCard() {
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/summary')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching summary:', err);
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

    return (
        <Card sx={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(16,185,129,0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Q4 2025 Revenue</Typography>
                    <Chip
                        label={data.status === 'ahead' ? 'On Track' : 'Behind Target'}
                        color={data.status === 'ahead' ? 'success' : 'error'}
                        size="small"
                    />
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                    {formatCurrency(data.currentQuarterRevenue)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Target</Typography>
                        <Typography variant="h6">{formatCurrency(data.target)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Gap</Typography>
                        <Typography variant="h6" color={data.gap >= 0 ? 'success.main' : 'error.main'}>
                            {data.gap >= 0 ? '+' : ''}{data.gap}%
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">vs Last Quarter</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {data.qoqChange >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                            <Typography variant="h6" color={data.qoqChange >= 0 ? 'success.main' : 'error.main'}>
                                {data.qoqChange >= 0 ? '+' : ''}{data.qoqChange}%
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default SummaryCard;
