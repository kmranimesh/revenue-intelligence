import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface RiskFactorsData {
    staleDeals: Array<{ dealId: string; accountName: string; repName: string; stage: string; amount: number; daysOpen: number }>;
    underperformingReps: Array<{ repId: string; name: string; winRate: number; avgWinRate: number; totalDeals: number; revenue: number }>;
    lowActivityAccounts: Array<{ accountId: string; name: string; segment: string; dealCount: number; activityCount: number; potentialValue: number }>;
}

function RiskFactorsCard() {
    const [data, setData] = useState<RiskFactorsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/risk-factors')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching risk factors:', err);
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
        if (value === null || value === undefined) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card sx={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="warning" /> Risk Factors
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Stale Deals ({data.staleDeals.length})
                    </Typography>
                    <List dense sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
                        {data.staleDeals.slice(0, 3).map((deal) => (
                            <ListItem key={deal.dealId}>
                                <ListItemText
                                    primary={deal.accountName}
                                    secondary={`${deal.repName} • ${deal.daysOpen} days • ${formatCurrency(deal.amount)}`}
                                />
                                <Chip label={deal.stage} size="small" color="warning" variant="outlined" />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonOffIcon fontSize="small" /> Underperforming Reps ({data.underperformingReps.length})
                    </Typography>
                    <List dense sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
                        {data.underperformingReps.slice(0, 3).map((rep) => (
                            <ListItem key={rep.repId}>
                                <ListItemText
                                    primary={rep.name}
                                    secondary={`${rep.winRate}% win rate (avg: ${rep.avgWinRate}%)`}
                                />
                                <Chip label={`${rep.totalDeals} deals`} size="small" variant="outlined" />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingDownIcon fontSize="small" /> Low Activity Accounts ({data.lowActivityAccounts.length})
                    </Typography>
                    <List dense sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
                        {data.lowActivityAccounts.slice(0, 3).map((account) => (
                            <ListItem key={account.accountId}>
                                <ListItemText
                                    primary={account.name}
                                    secondary={`${account.segment} • ${account.activityCount} activities • ${formatCurrency(account.potentialValue)}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
}

export default RiskFactorsCard;
