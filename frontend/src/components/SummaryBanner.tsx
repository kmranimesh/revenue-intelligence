import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

interface SummaryData {
    currentQuarterRevenue: number;
    target: number;
    gap: number;
    status: 'ahead' | 'behind';
}

function SummaryBanner() {
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/summary')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <Box sx={{ bgcolor: '#2d3a6d', py: 2.5, px: 4, textAlign: 'center' }}>
                <Skeleton variant="text" width={500} height={50} sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
        );
    }

    if (!data) return null;

    return (
        <Box sx={{
            background: 'linear-gradient(90deg, #2d3a6d 0%, #3d4a7d 100%)',
            py: 2,
            px: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 400, mr: 1 }}>QTD Revenue:</Typography>
                <Typography variant="h4" fontWeight="bold">{formatCurrency(data.currentQuarterRevenue)}</Typography>
            </Box>
            <Box sx={{ mx: 3, width: 2, height: 35, bgcolor: 'rgba(255,255,255,0.4)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 400, mr: 1 }}>Target:</Typography>
                <Typography variant="h5" fontWeight="medium">{formatCurrency(data.target)}</Typography>
            </Box>
            <Box sx={{ mx: 3, width: 2, height: 35, bgcolor: 'rgba(255,255,255,0.4)' }} />
            <Typography
                variant="h5"
                fontWeight="bold"
                color={data.gap >= 0 ? '#22c55e' : '#f97316'}
            >
                {data.gap >= 0 ? '+' : ''}{data.gap}% to Goal
            </Typography>
        </Box>
    );
}

export default SummaryBanner;
