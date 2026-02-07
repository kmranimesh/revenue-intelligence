import { Box, Grid } from '@mui/material';
import Header from './Header';
import SummaryBanner from './SummaryBanner';
import RevenueDrivers from './RevenueDrivers';
import TopRiskFactors from './TopRiskFactors';
import RecommendedActions from './RecommendedActions';
import RevenueTrend from './RevenueTrend';

function Dashboard() {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            <Header />
            <SummaryBanner />
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Left Column - Revenue Drivers (full height) */}
                    <Grid item xs={12} md={4}>
                        <RevenueDrivers />
                    </Grid>
                    {/* Right Side - 2 columns */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TopRiskFactors />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <RecommendedActions />
                            </Grid>
                            <Grid item xs={12}>
                                <RevenueTrend />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default Dashboard;
