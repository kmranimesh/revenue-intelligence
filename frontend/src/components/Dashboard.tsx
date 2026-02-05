import { Box, Container, Typography } from '@mui/material';

function Dashboard() {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Revenue Intelligence Console
            </Typography>
            <Box sx={{ mt: 4 }}>
                <Typography variant="body1" color="text.secondary">
                    Dashboard components loading...
                </Typography>
            </Box>
        </Container>
    );
}

export default Dashboard;
