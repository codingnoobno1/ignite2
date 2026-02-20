'use client';
import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Card, CardContent, Grid, InputAdornment } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Users, Award } from 'lucide-react';
import { cyberpunkTheme, colors, glowEffects } from '@/lib/theme';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import CubeDecorator from '@/components/ui/CubeDecorator';
import { useToast } from '@/components/ui/Toast';

export default function EntryPage() {
    const [teams, setTeams] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await fetch('/api/ignite2/teams');
            const data = await res.json();
            setTeams(data.teams || data);
        } catch (error) {
            console.error('Failed to fetch teams', error);
            showToast('Failed to load teams', 'error');
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setSelectedTeam(null);
    };

    const getFilteredTeams = () => {
        if (!searchQuery) return [];
        return teams.filter(team =>
            (team.name && team.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (team.id && team.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (team.members && team.members.some(m =>
                (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (m.enrollment && m.enrollment.includes(searchQuery)) ||
                (m.roll && m.roll.includes(searchQuery)) // fallback for old data
            ))
        );
    };

    const handleSelectTeam = (team) => {
        setSelectedTeam(team);
        setSearchQuery(team.name);
    };

    const handleCheckIn = async () => {
        if (!selectedTeam || loading) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ignite2/teams/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team_id: selectedTeam.id }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                showToast(`${selectedTeam.name} checked in successfully! 🚀`, 'success');
                fetchTeams();
                setSelectedTeam(result.team);
            } else {
                throw new Error(result.error || 'Check-in failed');
            }
        } catch (error) {
            showToast(error.message || 'Check-in failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredTeams = getFilteredTeams();

    return (
        <ThemeProvider theme={cyberpunkTheme}>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: colors.dark.bg,
                color: '#fff',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundImage: `
                    radial-gradient(circle at 20% 50%, ${colors.neonCyan}10 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, ${colors.neonPink}10 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%)
                `,
                position: 'relative',
            }}>
                <CubeDecorator position="top-right" size={120} opacity={0.2} />

                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                >
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                color: colors.neonCyan,
                                textShadow: glowEffects.cyan,
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                            }}
                        >
                            <Sparkles size={40} />
                            IGNITE 2.0
                            <Sparkles size={40} />
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: colors.neonPink,
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                            }}
                        >
                            Team Check-In
                        </Typography>
                    </Box>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ width: '100%', maxWidth: '700px' }}
                >
                    <Card sx={{
                        background: `linear-gradient(135deg, ${colors.dark.card} 0%, ${colors.dark.paper} 100%)`,
                        border: `2px solid ${colors.neonCyan}`,
                        boxShadow: glowEffects.cyan,
                        borderRadius: 0,
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 2,
                                        color: colors.neonCyan,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Search size={20} />
                                    Search Team
                                </Typography>

                                <TextField
                                    fullWidth
                                    placeholder="Enter team name, ID, or member name..."
                                    variant="outlined"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    autoComplete="off"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={20} color={colors.neonCyan} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: colors.dark.bg,
                                            '& fieldset': {
                                                borderColor: colors.dark.border,
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            <AnimatePresence>
                                {searchQuery && !selectedTeam && filteredTeams.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Box sx={{
                                            maxHeight: 250,
                                            overflowY: 'auto',
                                            bgcolor: colors.dark.bg,
                                            border: `1px solid ${colors.dark.border}`,
                                            mb: 3,
                                        }}>
                                            {filteredTeams.map((team, index) => (
                                                <motion.div
                                                    key={team.id}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Box
                                                        onClick={() => handleSelectTeam(team)}
                                                        sx={{
                                                            p: 2,
                                                            cursor: 'pointer',
                                                            borderBottom: `1px solid ${colors.dark.border}`,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                bgcolor: colors.dark.hover,
                                                                borderLeft: `4px solid ${colors.neonCyan}`,
                                                                pl: 3,
                                                            },
                                                        }}
                                                    >
                                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#fff' }}>
                                                            {team.name}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                                            <Typography variant="caption" sx={{ color: colors.neonPink }}>
                                                                {team.id}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: colors.neonPurple }}>
                                                                {team.track}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </motion.div>
                                            ))}
                                        </Box>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {selectedTeam && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    >
                                        <Card sx={{
                                            bgcolor: colors.dark.bg,
                                            border: `2px solid ${selectedTeam.status === 'arrived' ? colors.neonGreen : colors.neonPink}`,
                                            boxShadow: selectedTeam.status === 'arrived' ? glowEffects.green : glowEffects.pink,
                                            p: 3,
                                        }}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="h4" sx={{ color: '#fff', mb: 1, fontWeight: 700 }}>
                                                    {selectedTeam.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Award size={16} color={colors.neonPink} />
                                                        <Typography variant="body2" sx={{ color: colors.neonPink }}>
                                                            {selectedTeam.track}
                                                        </Typography>
                                                    </Box>
                                                    <StatusBadge status={selectedTeam.status} />
                                                </Box>
                                            </Box>

                                            <Typography variant="h6" sx={{ mb: 2, color: colors.neonCyan }}>
                                                <Users size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                                Team Members
                                            </Typography>
                                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                                {selectedTeam.members.map((member, i) => (
                                                    <Grid item xs={12} sm={6} key={i}>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                        >
                                                            <Box sx={{
                                                                p: 2,
                                                                bgcolor: colors.dark.card,
                                                                border: `1px solid ${colors.dark.border}`,
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    borderColor: colors.neonCyan,
                                                                    transform: 'translateX(5px)',
                                                                },
                                                            }}>
                                                                <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                                                                    {member.name}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: colors.neonPurple }}>
                                                                    Roll: {member.enrollment || member.roll}
                                                                </Typography>
                                                            </Box>
                                                        </motion.div>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            {selectedTeam.status === 'arrived' ? (
                                                <AnimatedButton
                                                    fullWidth
                                                    variant="success"
                                                    disabled
                                                    size="large"
                                                >
                                                    ✓ Already Checked In
                                                </AnimatedButton>
                                            ) : (
                                                <AnimatedButton
                                                    fullWidth
                                                    variant="primary"
                                                    onClick={handleCheckIn}
                                                    disabled={loading}
                                                    size="large"
                                                >
                                                    {loading ? 'Checking In...' : 'Check-In Team 🚀'}
                                                </AnimatedButton>
                                            )}
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {searchQuery && !selectedTeam && filteredTeams.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <Box sx={{
                                        textAlign: 'center',
                                        py: 4,
                                        color: colors.neonOrange,
                                    }}>
                                        <Typography variant="h6">
                                            No teams found
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                                            Try a different search term
                                        </Typography>
                                    </Box>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <ToastComponent />
            </Box>
        </ThemeProvider>
    );
}
