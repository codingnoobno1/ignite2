'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Correct hook for App Router
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#00e5ff' },
        secondary: { main: '#ff007f' },
        background: { default: '#000', paper: '#111' },
    },
    typography: { fontFamily: '"Orbitron", sans-serif' },
});

export default function TeamPage() {
    const { id } = useParams(); // Get team ID from URL
    const [team, setTeam] = useState(null);
    const [timerState, setTimerState] = useState({ isRunning: false, timeLeft: 3600 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTeam();
        }

        socket.on('timer-update', (state) => {
            setTimerState(state);
        });

        return () => {
            socket.off('timer-update');
        };
    }, [id]);

    const fetchTeam = async () => {
        try {
            const res = await fetch('/api/ignite2/teams');
            const data = await res.json();
            const myTeam = (data.teams || []).find((t) => t.id === id);
            setTeam(myTeam);
        } catch (error) {
            console.error("Failed to fetch team");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#000', color: '#fff' }}><CircularProgress color="secondary" /></Box>;

    if (!team) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#000', color: '#fff' }}><Typography variant="h4">Team Not Found</Typography></Box>;

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: '#000',
                color: '#fff',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%)'
            }}>

                {/* Header */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, borderBottom: '1px solid #333', pb: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00e5ff' }}>{team.name}</Typography>
                        <Typography variant="h6" sx={{ color: 'gray' }}>{team.track}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ color: '#fff' }}>I G N I T E  2 . 0</Typography>
                        <Typography variant="caption" sx={{ color: 'gray' }}>ID: {team.id}</Typography>
                    </Box>
                </Box>

                {/* Timer Display */}
                <motion.div
                    animate={{ scale: timerState.isRunning ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <Box sx={{
                        width: 300,
                        height: 300,
                        bgcolor: '#111',
                        borderRadius: '50%',
                        border: `4px solid ${timerState.isRunning ? '#ff007f' : '#333'}`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: timerState.isRunning ? '0 0 50px rgba(255, 0, 127, 0.5)' : 'none',
                        mb: 6
                    }}>
                        <Typography variant="h1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {formatTime(timerState.timeLeft)}
                        </Typography>
                    </Box>
                </motion.div>

                {/* Status Message */}
                {!timerState.isRunning && timerState.timeLeft === 3600 && (
                    <Typography variant="h5" sx={{ color: 'gray', animation: 'pulse 2s infinite' }}>Waiting for Admin to Start...</Typography>
                )}

            </Box>
        </ThemeProvider>
    );
}
