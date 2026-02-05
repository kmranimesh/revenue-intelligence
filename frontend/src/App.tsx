import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#6366f1' },
        secondary: { main: '#10b981' },
        background: { default: 'transparent', paper: 'rgba(255,255,255,0.05)' }
    },
    typography: {
        fontFamily: "'Inter', sans-serif"
    }
});

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Dashboard />
        </ThemeProvider>
    );
}

export default App;
