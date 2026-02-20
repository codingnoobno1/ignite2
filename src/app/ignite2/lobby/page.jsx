'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Zap, Radio } from 'lucide-react';
import { cyberpunkTheme, colors, glowEffects } from '@/lib/theme';
import TeamCard from '@/components/ui/TeamCard';
import WelcomeAnimation from '@/components/ui/WelcomeAnimation';
import RotatingCube from '@/components/RotatingCube';
import PixelPhone from '@/components/PixelPhone';

/* ─────────── theme constants ─────────── */
// Softer, "Deep Space" Palette
const lobbyColors = {
    bg: '#050510', // Deep Navy/Black
    primary: '#00d4ff', // Soft Cyan
    accent: '#d946ef', // Soft Magenta
    text: '#f0f9ff', // Pale Blue/White
    border: 'rgba(255, 255, 255, 0.1)',
    grid: 'rgba(0, 212, 255, 0.03)',
    // Status
    success: '#4ade80', // Soft Green
    warning: '#fbbf24', // Soft Amber
};

const lobbyGlows = {
    primary: `0 0 20px ${lobbyColors.primary}40`,
    accent: `0 0 20px ${lobbyColors.accent}40`,
    text: `0 0 12px ${lobbyColors.primary}60`,
};

/* ─────────── sub-components ─────────── */

const Stat = ({ label, value, color }) => (
    <Box textAlign="center">
        <Typography
            variant="h4"
            sx={{
                color: color || lobbyColors.primary,
                fontWeight: 'bold',
                textShadow: `0 0 15px ${color}50`,
                lineHeight: 1,
            }}
        >
            {value}
        </Typography>
        <Typography
            sx={{
                fontSize: 11,
                opacity: 0.6,
                letterSpacing: 2,
                textTransform: 'uppercase',
                mt: 0.5,
                color: lobbyColors.text
            }}
        >
            {label}
        </Typography>
    </Box>
);

const LiveIndicator = () => (
    <Box display="flex" alignItems="center" gap={1}>
        <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: lobbyColors.success,
                boxShadow: `0 0 10px ${lobbyColors.success}`,
            }}
        />
        <Typography
            sx={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                color: lobbyColors.success,
                textShadow: `0 0 8px ${lobbyColors.success}40`,
            }}
        >
            LIVE
        </Typography>
    </Box>
);

/* ─── floating neon beam (Softer) ─── */
const NeonBeam = ({ top, delay, color, width }) => (
    <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '100vw', opacity: [0, 0.5, 0.5, 0] }} // Reduced opacity
        transition={{
            duration: 10 + Math.random() * 8, // Slower
            delay,
            repeat: Infinity,
            ease: 'linear',
        }}
        style={{
            position: 'absolute',
            top,
            left: 0,
            width: width || 180,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            opacity: 0.3,
            zIndex: 0,
            pointerEvents: 'none',
        }}
    />
);

/* ─── animated grid background (Subtle) ─── */
const GridBackground = () => (
    <Box
        sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 0%, #1a1a3a 0%, #050510 100%)` // Deep gradient
        }}
    >
        {/* grid lines */}
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(${lobbyColors.grid} 1px, transparent 1px),
                    linear-gradient(90deg, ${lobbyColors.grid} 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px', // Larger grid, less dense
                maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 100%)' // Fade edges
            }}
        />

        {/* floating beams */}
        <NeonBeam top="15%" delay={0} color={lobbyColors.primary} width={220} />
        <NeonBeam top="40%" delay={5} color={lobbyColors.accent} width={160} />
        <NeonBeam top="75%" delay={2} color={lobbyColors.primary} width={200} />
    </Box>
);

/* ─── scanline overlay (Very subtle) ─── */
const ScanlineOverlay = () => (
    <Box
        sx={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)',
            opacity: 0.3,
        }}
    />
);

/* ─── corner accents (Minimal) ─── */
const CornerAccent = ({ position }) => {
    const style = {
        position: 'absolute',
        width: 20,
        height: 20,
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0.5
    };
    const borderStyle = `1px solid ${lobbyColors.primary}`;
    const map = {
        tl: { top: 0, left: 0, borderTop: borderStyle, borderLeft: borderStyle },
        tr: { top: 0, right: 0, borderTop: borderStyle, borderRight: borderStyle },
        bl: { bottom: 0, left: 0, borderBottom: borderStyle, borderLeft: borderStyle },
        br: { bottom: 0, right: 0, borderBottom: borderStyle, borderRight: borderStyle },
    };
    return <Box sx={{ ...style, ...map[position] }} />;
};

/* ════════════════════════════════════════════════════════════
   MAIN LOBBY PAGE
   ════════════════════════════════════════════════════════════ */

export default function LobbyPage() {
    const [teams, setTeams] = useState([]);
    const [newTeam, setNewTeam] = useState(null);
    const prevCountRef = useRef(0);
    const [clock, setClock] = useState('');
    const [roundState, setRoundState] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [pixelDisplay, setPixelDisplay] = useState(null);

    // ... (Clock, Fetch, Timer Logic remains same) ...

    /* real-time clock */
    useEffect(() => {
        const tick = () =>
            setClock(
                new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            );
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    /* polling */
    const lastResetRef = useRef(0);
    const fetchData = useCallback(async () => {
        try {
            const resTeams = await fetch('/api/ignite2/teams?status=arrived');
            const dataTeams = await resTeams.json();
            const arrivedTeams = dataTeams.teams || dataTeams.filter?.(t => t.status === 'arrived') || [];

            if (arrivedTeams.length > prevCountRef.current && prevCountRef.current > 0) {
                const latestTeam = arrivedTeams[arrivedTeams.length - 1];
                setNewTeam(latestTeam);
            }
            setTeams(arrivedTeams);
            prevCountRef.current = arrivedTeams.length;

            const resRound = await fetch('/api/ignite2/round');
            const dataRound = await resRound.json();

            if (dataRound.competition_state) {
                const newState = dataRound.competition_state;
                if (newState.pixelDisplay) {
                    // Check if new payload or type to trigger animation?
                    // React key on PixelPhone triggers re-render automatically on object change.
                    setPixelDisplay(newState.pixelDisplay);
                } else if (newState.adminMessage) {
                    // Fallback for transition
                    setPixelDisplay({ type: 'text', payload: newState.adminMessage });
                }

                const currentRound = newState.current_round;
                const timerKey = currentRound === 1 ? 'round_1_timer' : 'round_2_timer';
                const timer = newState[timerKey];

                if (!roundState || (timer.lastReset && timer.lastReset > lastResetRef.current)) {
                    setRoundState(newState);
                    lastResetRef.current = timer.lastReset || Date.now();
                }
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    }, [roundState, pixelDisplay]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAnimationComplete = () => setNewTeam(null);
    const currentRound = roundState?.current_round || 1;
    const timerKey = currentRound === 1 ? 'round_1_timer' : 'round_2_timer';
    const currentTimer = roundState?.[timerKey] || {};
    const isTimerRunning = currentTimer.is_running;

    useEffect(() => {
        if (!roundState) return;
        const tick = () => {
            const now = new Date();
            let rem = 0;
            const cRound = roundState.current_round;
            const tKey = cRound === 1 ? 'round_1_timer' : 'round_2_timer';
            const timer = roundState[tKey];
            if (timer.is_running && timer.end_time) {
                const endTime = new Date(timer.end_time);
                rem = Math.max(0, Math.floor((endTime - now) / 1000));
            } else {
                rem = timer.remaining || 0;
            }
            setTimeRemaining(rem);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [roundState]);

    const fmtLobbyTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    /* ─── render ─── */
    return (
        <ThemeProvider theme={cyberpunkTheme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: lobbyColors.bg,
                    color: lobbyColors.text,
                    position: 'relative',
                    overflow: 'hidden',
                    px: { xs: 2, md: 5 },
                    py: { xs: 2, md: 4 },
                }}
            >
                {/* ── layers ── */}
                <GridBackground />
                <ScanlineOverlay />

                {/* ── content wrapper ── */}
                <Box sx={{ position: 'relative', zIndex: 2 }}>

                    {/* ════════  HUD BAR  ════════ */}
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box
                            sx={{
                                backdropFilter: 'blur(16px)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${lobbyColors.border}`,
                                borderRadius: 4,
                                px: { xs: 2, md: 5 }, // More horizontal padding
                                py: { xs: 2, md: 3 },
                                mb: { xs: 3, md: 5 },
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            <Grid container alignItems="center" spacing={4}> {/* Increased spacing */}
                                {/* TITLE + CUBE */}
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}> {/* Increased Gap */}
                                        <Box sx={{ width: 60, height: 60, position: 'relative' }}>
                                            <RotatingCube size={50} />
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    fontWeight: 800,
                                                    color: '#fff',
                                                    letterSpacing: 2,
                                                    lineHeight: 1,
                                                    fontSize: { xs: '1.4rem', md: '1.8rem' },
                                                }}
                                            >
                                                IGNITE 2.0
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: lobbyColors.primary,
                                                    opacity: 0.8,
                                                    fontSize: 12,
                                                    letterSpacing: 4,
                                                    textTransform: 'uppercase',
                                                    mt: 0.5
                                                }}
                                            >
                                                Live Round {currentRound}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* CENTER - TIMER */}
                                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{
                                            display: 'block',
                                            color: isTimerRunning ? lobbyColors.success : lobbyColors.warning,
                                            letterSpacing: 3,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            mb: 1
                                        }}>
                                            {isTimerRunning ? '● SYSTEM ACTIVE' : '○ PAUSED'}
                                        </Typography>
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                fontFamily: '"Fira Code", monospace',
                                                fontWeight: 700,
                                                color: '#fff',
                                                textShadow: isTimerRunning ? lobbyGlows.text : 'none',
                                                letterSpacing: 2,
                                                fontSize: { xs: '3rem', md: '4.5rem' },
                                                lineHeight: 1,
                                            }}
                                        >
                                            {fmtLobbyTime(timeRemaining)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* STATS */}
                                <Grid item xs={12} md={4}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                            alignItems: 'center',
                                            gap: { xs: 3, md: 5 },
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Stat label="Teams" value={teams.length} color={lobbyColors.primary} />
                                        <Stat
                                            label="Members"
                                            value={teams.reduce((a, t) => a + (t.members?.length || 0), 0)}
                                            color={lobbyColors.accent}
                                        />
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                border: `1px solid ${lobbyColors.border}`,
                                                borderRadius: 2,
                                                fontFamily: '"Fira Code", monospace',
                                                fontSize: 14,
                                                letterSpacing: 2,
                                                color: lobbyColors.text,
                                                minWidth: 95,
                                                textAlign: 'center',
                                                background: 'rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            {clock}
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </motion.div>

                    {/* ════════  TEAM GRID  ════════ */}
                    {teams.length > 0 ? (
                        <Grid container spacing={3}>
                            <AnimatePresence mode="popLayout">
                                {teams.map((team, index) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={team.id || team._id}>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            transition={{
                                                delay: index * 0.03,
                                                type: 'spring',
                                                stiffness: 120,
                                                damping: 15,
                                            }}
                                        >
                                            <TeamCard
                                                team={team}
                                                variant="compact"
                                                animationDelay={0}
                                            />
                                        </motion.div>
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>
                    ) : (
                        /* ── empty state ── */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 12,
                                    px: 4,
                                    borderRadius: 4,
                                    background: 'rgba(255,255,255,0.02)',
                                    border: `1px dashed ${lobbyColors.border}`,
                                }}
                            >
                                {/* Simple Pulsing Icon */}
                                <motion.div
                                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <Radio size={60} color={lobbyColors.text} style={{ marginBottom: 24, opacity: 0.5 }} />
                                </motion.div>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: lobbyColors.primary,
                                        letterSpacing: 2,
                                        mb: 1,
                                    }}
                                >
                                    WAITING FOR TEAMS
                                </Typography>
                            </Box>
                        </motion.div>
                    )}
                </Box>

                {/* ── Welcome Animation Overlay ── */}
                <AnimatePresence>
                    {newTeam && (
                        <WelcomeAnimation
                            team={newTeam}
                            onDismiss={handleAnimationComplete}
                            autoHideDuration={5000}
                        />
                    )}
                </AnimatePresence>

                {/* ── PIXEL PHONE MESSAGE BOX (Fixed Bottom Right) ── */}
                <Box sx={{ position: 'fixed', bottom: 40, right: 40, zIndex: 10 }}>
                    <PixelPhone display={pixelDisplay} />
                </Box>

            </Box>
        </ThemeProvider>
    );
}
