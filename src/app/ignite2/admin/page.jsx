'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Card, CardContent, Tabs, Tab, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Slider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Clock, XCircle, AlertTriangle, MinusCircle, Award, RotateCcw, Timer, Zap, Play, Pause, RefreshCw } from 'lucide-react';
import { cyberpunkTheme, colors, glowEffects } from '@/lib/theme';
import TeamCard from '@/components/ui/TeamCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

/* ─── helper: format seconds to MM:SS ─── */
function fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ─── timer duration presets in minutes ─── */
const TIMER_PRESETS = [15, 30, 45, 60, 90, 120];

export default function AdminPage() {
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [trackFilter, setTrackFilter] = useState('');
    const [statusCounts, setStatusCounts] = useState({});
    const [competitionState, setCompetitionState] = useState(null);
    const [timerDuration, setTimerDuration] = useState(60); // minutes
    const [resetting, setResetting] = useState(false);

    const { showToast, ToastComponent } = useToast();
    const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

    /* ─── fetch teams ─── */
    const fetchTeams = useCallback(async () => {
        try {
            const res = await fetch('/api/ignite2/teams');
            const data = await res.json();
            setTeams(data.teams || data);
            setStatusCounts(data.by_status || {});
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch teams', error);
            showToast('Failed to load teams', 'error');
            setLoading(false);
        }
    }, []);

    /* ─── fetch round/timer state ─── */
    const fetchRoundState = useCallback(async () => {
        try {
            const res = await fetch('/api/ignite2/round');
            const data = await res.json();
            setCompetitionState(data.competition_state);
            if (data.competition_state) {
                const currentRound = data.competition_state.current_round;
                const timerKey = currentRound === 1 ? 'round_1_timer' : 'round_2_timer';
                const dur = data.competition_state[timerKey]?.duration || 3600;
                setTimerDuration(Math.round(dur / 60));
            }
        } catch (error) {
            console.error('Failed to fetch round state', error);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
        fetchRoundState();
        const interval = setInterval(() => {
            fetchTeams();
            fetchRoundState();
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchTeams, fetchRoundState]);

    useEffect(() => {
        applyFilters();
    }, [teams, activeTab, searchQuery, trackFilter]);

    const applyFilters = () => {
        let filtered = teams;
        if (activeTab !== 'all') {
            filtered = filtered.filter(team => team.status === activeTab);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(team =>
                team.name?.toLowerCase().includes(query) ||
                team.id?.toLowerCase().includes(query) ||
                team.members?.some(m => m.name?.toLowerCase().includes(query))
            );
        }
        if (trackFilter) {
            filtered = filtered.filter(team => team.track === trackFilter);
        }
        setFilteredTeams(filtered);
    };

    /* ─── status change ─── */
    const handleStatusChange = async (teamId, newStatus, reason = '') => {
        try {
            const res = await fetch('/api/ignite2/teams/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    team_id: teamId,
                    new_status: newStatus,
                    reason,
                    admin: 'admin'
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                showToast(`Team status updated to ${newStatus}`, 'success');
                fetchTeams();
            } else {
                throw new Error(result.error || 'Status update failed');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleRemoveTeam = (team) => {
        showConfirm({
            title: 'Remove Team',
            message: `Are you sure you want to remove ${team.name}?`,
            variant: 'warning',
            onConfirm: () => handleStatusChange(team.id, 'removed', 'Removed by admin'),
        });
    };

    const handleDisqualifyTeam = (team) => {
        showConfirm({
            title: 'Disqualify Team',
            message: `Are you sure you want to disqualify ${team.name}?`,
            variant: 'danger',
            onConfirm: () => handleStatusChange(team.id, 'disqualified', 'Disqualified by admin'),
        });
    };

    const handleRestoreTeam = (team) => {
        showConfirm({
            title: 'Restore Team',
            message: `Restore ${team.name} to active status?`,
            variant: 'info',
            onConfirm: () => handleStatusChange(team.id, 'arrived', 'Restored by admin'),
        });
    };

    /* ─── RESET LOBBY ─── */
    const handleResetLobby = () => {
        showConfirm({
            title: '⚠️ Reset Lobby',
            message: 'This will set ALL teams back to pending and reset competition timers. This cannot be undone. Are you sure?',
            variant: 'danger',
            onConfirm: async () => {
                setResetting(true);
                try {
                    const res = await fetch('/api/ignite2/reset', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ confirm: 'RESET', admin: 'admin' }),
                    });
                    const result = await res.json();
                    if (res.ok && result.success) {
                        showToast(`Lobby reset — ${result.teams_reset} teams set to pending`, 'success');
                        fetchTeams();
                        fetchRoundState();
                    } else {
                        throw new Error(result.error || 'Reset failed');
                    }
                } catch (error) {
                    showToast(error.message, 'error');
                } finally {
                    setResetting(false);
                }
            },
        });
    };

    /* ─── TIMER CONTROLS ─── */
    const handleSetTimer = async (minutes) => {
        const durationSec = minutes * 60;
        const round = competitionState?.current_round || 1;
        try {
            const res = await fetch('/api/ignite2/round/timer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round, action: 'set', duration: durationSec }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                showToast(`Timer set to ${minutes} minutes for Round ${round}`, 'success');
                setTimerDuration(minutes);
                fetchRoundState();
            } else {
                throw new Error(result.error || 'Timer set failed');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleTimerAction = async (action) => {
        const round = competitionState?.current_round || 1;
        try {
            const res = await fetch('/api/ignite2/round/timer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round, action }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                showToast(`Timer ${action}ed for Round ${round}`, 'success');
                fetchRoundState();
            } else {
                throw new Error(result.error || `Timer ${action} failed`);
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleSetRound = async (round) => {
        try {
            const res = await fetch('/api/ignite2/round/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round, admin: 'admin' }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                showToast(`Round set to ${round}`, 'success');
                fetchRoundState();
            } else {
                throw new Error(result.error || 'Set round failed');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    /* ─── derived values ─── */
    const currentRound = competitionState?.current_round || 1;
    const timerKey = currentRound === 1 ? 'round_1_timer' : 'round_2_timer';
    const currentTimer = competitionState?.[timerKey] || {};
    const tracks = [...new Set(teams.map(t => t.track).filter(Boolean))];

    const tabs = [
        { value: 'all', label: 'All Teams', icon: Users, count: statusCounts.all || teams.length },
        { value: 'arrived', label: 'Arrived', icon: Users, count: statusCounts.arrived || 0 },
        { value: 'pending', label: 'Pending', icon: Clock, count: statusCounts.pending || 0 },
        { value: 'removed', label: 'Removed', icon: XCircle, count: statusCounts.removed || 0 },
        { value: 'disqualified', label: 'DQ', icon: AlertTriangle, count: statusCounts.disqualified || 0 },
        { value: 'eliminated', label: 'Eliminated', icon: MinusCircle, count: statusCounts.eliminated || 0 },
    ];

    if (loading) {
        return (
            <ThemeProvider theme={cyberpunkTheme}>
                <Box sx={{ minHeight: '100vh', bgcolor: colors.dark.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner message="Loading Dashboard..." />
                </Box>
            </ThemeProvider>
        );
    }

    /* ─── RENDER ─── */
    return (
        <ThemeProvider theme={cyberpunkTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: colors.dark.bg, color: '#fff', p: { xs: 2, md: 4 } }}>

                {/* ─── HEADER ─── */}
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Zap size={28} color={colors.neonCyan} />
                            <Typography variant="h3" sx={{ color: colors.neonCyan, textShadow: glowEffects.cyan, fontWeight: 900, letterSpacing: 3, fontSize: { xs: '1.4rem', md: '2rem' } }}>
                                IGNITE 2.0 CONTROL PANEL
                            </Typography>
                        </Box>
                        <AnimatedButton
                            variant="danger"
                            size="small"
                            onClick={handleResetLobby}
                            disabled={resetting}
                        >
                            <RotateCcw size={16} style={{ marginRight: 6 }} />
                            {resetting ? 'Resetting...' : 'Reset Lobby'}
                        </AnimatedButton>
                    </Box>
                </motion.div>

                {/* ═══════ ROUND + TIMER CONTROLS ═══════ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card sx={{
                        mb: 3,
                        bgcolor: 'rgba(10,10,22,0.65)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${colors.dark.border}`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* glow strip */}
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                            background: `linear-gradient(90deg, transparent, ${colors.neonPurple}, transparent)`,
                        }} />
                        <CardContent sx={{ py: 3 }}>
                            <Grid container spacing={3} alignItems="center">

                                {/* ROUND SELECTOR */}
                                <Grid item xs={12} md={3}>
                                    <Typography variant="caption" sx={{ color: colors.neonPurple, letterSpacing: 2, mb: 1, display: 'block' }}>
                                        CURRENT ROUND
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {[1, 2].map(r => (
                                            <AnimatedButton
                                                key={r}
                                                variant={currentRound === r ? 'primary' : 'secondary'}
                                                size="small"
                                                onClick={() => handleSetRound(r)}
                                                sx={{ flex: 1 }}
                                            >
                                                Round {r}
                                            </AnimatedButton>
                                        ))}
                                    </Box>
                                </Grid>

                                {/* TIMER DURATION */}
                                <Grid item xs={12} md={5}>
                                    <Typography variant="caption" sx={{ color: colors.neonCyan, letterSpacing: 2, mb: 1, display: 'block' }}>
                                        <Timer size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                        TIMER DURATION
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {TIMER_PRESETS.map(m => (
                                            <AnimatedButton
                                                key={m}
                                                variant={timerDuration === m ? 'primary' : 'secondary'}
                                                size="small"
                                                onClick={() => handleSetTimer(m)}
                                                sx={{ minWidth: 48 }}
                                            >
                                                {m}m
                                            </AnimatedButton>
                                        ))}
                                    </Box>
                                </Grid>

                                {/* TIMER STATUS + ACTIONS */}
                                <Grid item xs={12} md={4}>
                                    <Typography variant="caption" sx={{ color: colors.neonOrange, letterSpacing: 2, mb: 1, display: 'block' }}>
                                        TIMER STATUS
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="h4" sx={{
                                            fontFamily: '"Fira Code", monospace',
                                            color: currentTimer.is_running ? colors.neonGreen : colors.neonOrange,
                                            textShadow: `0 0 10px ${currentTimer.is_running ? colors.neonGreen : colors.neonOrange}60`,
                                            fontWeight: 700,
                                            minWidth: 100,
                                        }}>
                                            {fmtTime(currentTimer.remaining || 0)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {!currentTimer.is_running ? (
                                                <AnimatedButton variant="success" size="small" onClick={() => handleTimerAction('start')}>
                                                    <Play size={16} />
                                                </AnimatedButton>
                                            ) : (
                                                <AnimatedButton variant="warning" size="small" onClick={() => handleTimerAction('pause')}>
                                                    <Pause size={16} />
                                                </AnimatedButton>
                                            )}
                                            <AnimatedButton variant="secondary" size="small" onClick={() => handleTimerAction('reset')}>
                                                <RefreshCw size={16} />
                                            </AnimatedButton>
                                        </Box>
                                    </Box>
                                </Grid>

                            </Grid>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ═══════ STATUS TABS ═══════ */}
                <Card sx={{ mb: 3, bgcolor: colors.dark.card, border: `1px solid ${colors.dark.border}` }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': { color: '#fff', textTransform: 'uppercase', fontWeight: 600, '&.Mui-selected': { color: colors.neonCyan } },
                            '& .MuiTabs-indicator': { backgroundColor: colors.neonCyan, height: 3, boxShadow: glowEffects.cyan },
                        }}
                    >
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <Tab
                                    key={tab.value}
                                    value={tab.value}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Icon size={18} />
                                            {tab.label}
                                            <Box sx={{
                                                ml: 1, px: 1, py: 0.5,
                                                bgcolor: activeTab === tab.value ? colors.neonCyan : colors.dark.border,
                                                color: activeTab === tab.value ? '#000' : '#fff',
                                                borderRadius: 1, fontSize: '0.75rem', fontWeight: 700,
                                            }}>
                                                {tab.count}
                                            </Box>
                                        </Box>
                                    }
                                />
                            );
                        })}
                    </Tabs>
                </Card>

                {/* ═══════ FILTERS ═══════ */}
                <Card sx={{ mb: 3, bgcolor: colors.dark.card, border: `1px solid ${colors.dark.border}` }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Search teams..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={20} color={colors.neonCyan} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Filter by Track</InputLabel>
                                    <Select
                                        value={trackFilter}
                                        onChange={(e) => setTrackFilter(e.target.value)}
                                        label="Filter by Track"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Filter size={20} color={colors.neonPink} />
                                            </InputAdornment>
                                        }
                                    >
                                        <MenuItem value="">All Tracks</MenuItem>
                                        {tracks.map(track => (
                                            <MenuItem key={track} value={track}>{track}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* ═══════ TEAMS GRID ═══════ */}
                {filteredTeams.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredTeams.map((team, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={team.id || team._id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                >
                                    <Card sx={{
                                        bgcolor: 'rgba(10,10,22,0.55)',
                                        backdropFilter: 'blur(14px)',
                                        border: `1px solid ${colors.dark.border}`,
                                        '&:hover': { borderColor: colors.neonCyan },
                                    }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 1, color: '#fff' }}>
                                                {team.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <Award size={14} color={colors.neonPink} />
                                                <Typography variant="caption" sx={{ color: colors.neonPink }}>
                                                    {team.track}
                                                </Typography>
                                            </Box>
                                            <StatusBadge status={team.status} size="small" />

                                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {team.status === 'arrived' && (
                                                    <>
                                                        <AnimatedButton fullWidth variant="secondary" size="small" onClick={() => handleRemoveTeam(team)}>
                                                            Remove
                                                        </AnimatedButton>
                                                        <AnimatedButton fullWidth variant="danger" size="small" onClick={() => handleDisqualifyTeam(team)}>
                                                            Disqualify
                                                        </AnimatedButton>
                                                    </>
                                                )}
                                                {(team.status === 'removed' || team.status === 'disqualified') && (
                                                    <AnimatedButton fullWidth variant="success" size="small" onClick={() => handleRestoreTeam(team)}>
                                                        Restore
                                                    </AnimatedButton>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8, color: colors.neonOrange }}>
                        <Typography variant="h5">No teams found</Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                            Try adjusting your filters, or check in teams from the Entry page
                        </Typography>
                    </Box>
                )}

                <ToastComponent />
                <ConfirmDialogComponent />
            </Box>
        </ThemeProvider>
    );
}
