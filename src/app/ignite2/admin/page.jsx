'use client';
import React, { useState, useEffect, useCallback } from 'react';
// Trigger rebuild
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { cyberpunkTheme, colors } from '@/lib/theme';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

// Import refactored components
import AdminHeader from './components/AdminHeader';
import TimerControls from './components/TimerControls';
import PixelDisplayControls from './components/PixelDisplayControls';
import TeamManager from './components/TeamManager';

/* - helper: format seconds to MM:SS - */
function fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

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
    const [adminMessage, setAdminMessage] = useState("");
    const [displayMode, setDisplayMode] = useState('text');
    const [importing, setImporting] = useState(false);

    const { showToast, ToastComponent } = useToast();
    const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

    /* - fetch teams - */
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

    /* - fetch round/timer state - */
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

    const handleUpdateDisplay = async (type = displayMode, payload = adminMessage) => {
        try {
            const res = await fetch('/api/ignite2/round/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, payload, admin: 'admin' }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                showToast(`Display updated: ${payload} (${type})`, 'success');
                fetchRoundState();
                if (type === 'text') setAdminMessage(""); // clear hype text
            } else {
                throw new Error(result.error || 'Failed to update display');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

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

    /* - status change - */
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

    /* - RESET LOBBY - */
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

    /* - TIMER CONTROLS - */
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

    /* - derived values - */
    const currentRound = competitionState?.current_round || 1;
    const timerKey = currentRound === 1 ? 'round_1_timer' : 'round_2_timer';
    const currentTimer = competitionState?.[timerKey] || {};

    if (loading) {
        return (
            <ThemeProvider theme={cyberpunkTheme}>
                <Box sx={{ minHeight: '100vh', bgcolor: colors.dark.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner message="Loading Dashboard..." />
                </Box>
            </ThemeProvider>
        );
    }

    /* - IMPORT CSV - */

    const handleImportCSV = async () => {
        showConfirm({
            title: 'Import Teams',
            message: 'This will import teams from the CSV file. Existing teams will be updated. Continue?',
            variant: 'info',
            onConfirm: async () => {
                setImporting(true);
                try {
                    const res = await fetch('/api/ignite2/teams/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ admin: 'admin' }),
                    });
                    const result = await res.json();
                    if (res.ok && result.success) {
                        showToast(result.message, 'success');
                        fetchTeams();
                    } else {
                        throw new Error(result.error || 'Import failed');
                    }
                } catch (error) {
                    showToast(error.message, 'error');
                } finally {
                    setImporting(false);
                }
            },
        });
    };

    /* - RENDER - */
    return (
        <ThemeProvider theme={cyberpunkTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: colors.dark.bg, color: '#fff', p: { xs: 2, md: 4 } }}>

                <AdminHeader
                    onReset={handleResetLobby}
                    isResetting={resetting}
                    onImport={handleImportCSV}
                    isImporting={importing}
                />

                <TimerControls
                    currentRound={currentRound}
                    timerDuration={timerDuration}
                    currentTimer={currentTimer}
                    onSetRound={handleSetRound}
                    onSetTimer={handleSetTimer}
                    onTimerAction={handleTimerAction}
                    fmtTime={fmtTime}
                />

                <PixelDisplayControls
                    displayMode={displayMode}
                    setDisplayMode={setDisplayMode}
                    adminMessage={adminMessage}
                    setAdminMessage={setAdminMessage}
                    onUpdateDisplay={handleUpdateDisplay}
                />

                <TeamManager
                    teams={teams}
                    filteredTeams={filteredTeams}
                    statusCounts={statusCounts}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    trackFilter={trackFilter}
                    setTrackFilter={setTrackFilter}
                    onRemove={handleRemoveTeam}
                    onDisqualify={handleDisqualifyTeam}
                    onRestore={handleRestoreTeam}
                />

                <ToastComponent />
                <ConfirmDialogComponent />
            </Box>
        </ThemeProvider>
    );
}
