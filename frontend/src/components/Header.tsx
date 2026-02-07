import { AppBar, Toolbar, Typography, Box, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Header() {
    return (
        <AppBar position="static" sx={{
            background: 'linear-gradient(90deg, #1a1f3c 0%, #2d3561 100%)',
            boxShadow: 'none'
        }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f97316 0%, #eab308 50%, #22c55e 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#1a1f3c' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">SkyGeni</Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton color="inherit"><ChatIcon /></IconButton>
                    <IconButton color="inherit">
                        <Badge badgeContent={3} color="error"><NotificationsIcon /></Badge>
                    </IconButton>
                    <IconButton color="inherit"><AccountCircleIcon /></IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
