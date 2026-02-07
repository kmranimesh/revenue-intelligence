import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface RecommendationsData {
    recommendations: Array<{ priority: string; category: string; action: string; impact: string }>;
}

function RecommendedActions() {
    const [data, setData] = useState<RecommendationsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/recommendations')
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
                    <Skeleton variant="text" width={180} />
                    <Skeleton variant="rectangular" height={150} sx={{ mt: 2 }} />
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    return (
        <Card sx={{ bgcolor: 'white', color: '#1a1f3c', height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Recommended Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {data.recommendations.slice(0, 3).map((rec, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 18, mt: 0.3 }} />
                            <Typography variant="body1">{rec.action}</Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}

export default RecommendedActions;
