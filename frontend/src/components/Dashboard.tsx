import { Container, Typography, Grid } from '@mui/material';
import SummaryCard from './SummaryCard';

function Dashboard() {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Revenue Intelligence Console
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Q4 2025 Performance Overview
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <SummaryCard />
                </Grid>
            </Grid>
        </Container>
    );
}

export default Dashboard;
