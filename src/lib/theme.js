import { createTheme } from '@mui/material/styles';

// Cyberpunk/Neon color palette
export const colors = {
    neonCyan: '#00e5ff',
    neonPink: '#ff007f',
    neonPurple: '#b026ff',
    neonGreen: '#39ff14',
    neonOrange: '#ff6600',
    neonBlue: '#0ff',
    
    dark: {
        bg: '#000000',
        paper: '#0a0a0a',
        card: '#111111',
        border: '#222222',
        hover: '#1a1a1a',
    },
    
    status: {
        pending: '#ff9800',
        arrived: '#39ff14',
        removed: '#ff6600',
        disqualified: '#ff007f',
        eliminated: '#666666',
    }
};

// Glow effect CSS
export const glowEffects = {
    cyan: `0 0 10px ${colors.neonCyan}, 0 0 20px ${colors.neonCyan}, 0 0 30px ${colors.neonCyan}`,
    pink: `0 0 10px ${colors.neonPink}, 0 0 20px ${colors.neonPink}, 0 0 30px ${colors.neonPink}`,
    purple: `0 0 10px ${colors.neonPurple}, 0 0 20px ${colors.neonPurple}, 0 0 30px ${colors.neonPurple}`,
    green: `0 0 10px ${colors.neonGreen}, 0 0 20px ${colors.neonGreen}, 0 0 30px ${colors.neonGreen}`,
    orange: `0 0 10px ${colors.neonOrange}, 0 0 20px ${colors.neonOrange}, 0 0 30px ${colors.neonOrange}`,
};

// Material-UI theme with cyberpunk styling
export const cyberpunkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: colors.neonCyan,
            light: '#33ebff',
            dark: '#00b8cc',
        },
        secondary: {
            main: colors.neonPink,
            light: '#ff3399',
            dark: '#cc0066',
        },
        success: {
            main: colors.neonGreen,
        },
        warning: {
            main: colors.neonOrange,
        },
        info: {
            main: colors.neonBlue,
        },
        background: {
            default: colors.dark.bg,
            paper: colors.dark.paper,
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
        },
    },
    typography: {
        fontFamily: '"Inter", "Orbitron", "Roboto", sans-serif',
        h1: {
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
        },
        h2: {
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
        },
        h3: {
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.06em',
        },
        h4: {
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 600,
        },
        h5: {
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 500,
        },
        h6: {
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 500,
        },
        body1: {
            fontFamily: '"Inter", sans-serif',
        },
        body2: {
            fontFamily: '"Inter", sans-serif',
        },
        button: {
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
        },
        code: {
            fontFamily: '"Fira Code", monospace',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: glowEffects.cyan,
                    },
                },
                contained: {
                    background: `linear-gradient(135deg, ${colors.neonCyan} 0%, ${colors.neonPurple} 100%)`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colors.neonPurple} 0%, ${colors.neonPink} 100%)`,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.dark.card,
                    border: `1px solid ${colors.dark.border}`,
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: colors.neonCyan,
                        boxShadow: `0 0 20px ${colors.neonCyan}40`,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: colors.neonCyan,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: colors.neonCyan,
                            boxShadow: `0 0 10px ${colors.neonCyan}40`,
                        },
                    },
                },
            },
        },
    },
});

// Helper function to get status color
export function getStatusColor(status) {
    return colors.status[status] || colors.status.pending;
}

// Helper function to get status glow
export function getStatusGlow(status) {
    const color = getStatusColor(status);
    return `0 0 10px ${color}, 0 0 20px ${color}`;
}
