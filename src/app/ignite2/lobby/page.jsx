'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Zap, Radio } from 'lucide-react';
import { cyberpunkTheme, colors, glowEffects } from '@/lib/theme';
import TeamCard from '@/components/ui/TeamCard';
import WelcomeAnimation from '@/components/ui/WelcomeAnimation';

/* ─────────── sub-components ─────────── */

const Stat = ({ label, value, color = colors.neonPink }) => (
    <Box textAlign="center">
        <Typography
            variant="h4"
            sx={{
                color,
                fontWeight: 'bold',
                textShadow: `0 0 12px ${color}80`,
                lineHeight: 1,
            }}
        >
            {value}
        </Typography>
        <Typography
            sx={{
                fontSize: 11,
                opacity: 0.55,
                letterSpacing: 2,
                textTransform: 'uppercase',
                mt: 0.5,
            }}
        >
            {label}
        </Typography>
    </Box>
);

const LiveIndicator = () => (
    <Box display="flex" alignItems="center" gap={1}>
        <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#00ffea',
                boxShadow: '0 0 14px #00ffea, 0 0 28px #00ffea40',
            }}
        />
        <Typography
            sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                color: '#00ffea',
                textShadow: '0 0 6px #00ffeaaa',
            }}
        >
            LIVE
        </Typography>
    </Box>
);

/* ─── floating neon beam ─── */
const NeonBeam = ({ top, delay, color, width }) => (
    <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '200vw', opacity: [0, 1, 1, 0] }}
        transition={{
            duration: 8 + Math.random() * 6,
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
            boxShadow: `0 0 8px ${color}60`,
            zIndex: 0,
            pointerEvents: 'none',
        }}
    />
);

/* ─── animated grid background ─── */
const GridBackground = () => (
    <Box
        sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none',
        }}
    >
        {/* grid lines */}
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
            }}
        />
        {/* radial glow center */}
        <motion.div
            animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.05, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
                position: 'absolute',
                inset: 0,
                background:
                    'radial-gradient(ellipse at 30% 20%, rgba(0,229,255,0.07) 0%, transparent 50%), radial-gradient(ellipse at 75% 75%, rgba(255,0,127,0.06) 0%, transparent 50%)',
            }}
        />
        {/* floating beams */}
        <NeonBeam top="15%" delay={0} color={colors.neonCyan} width={220} />
        <NeonBeam top="40%" delay={3} color={colors.neonPink} width={160} />
        <NeonBeam top="65%" delay={6} color={colors.neonPurple} width={200} />
        <NeonBeam top="85%" delay={9} color={colors.neonCyan} width={140} />
    </Box>
);

/* ─── scanline overlay ─── */
const ScanlineOverlay = () => (
    <Box
        sx={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
            mixBlendMode: 'overlay',
            opacity: 0.35,
        }}
    />
);

/* ─── corner accents ─── */
const CornerAccent = ({ position }) => {
    const style = {
        position: 'absolute',
        width: 30,
        height: 30,
        zIndex: 2,
        pointerEvents: 'none',
    };
    const borderStyle = `2px solid ${colors.neonCyan}40`;
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

    /* real-time clock */
    useEffect(() => {
        const tick = () =>
            setClock(
                new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                })
            );
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    /* polling */
    const fetchTeams = useCallback(async () => {
        try {
            const res = await fetch('/api/ignite2/teams?status=arrived');
            const data = await res.json();
            const arrivedTeams = data.teams || data.filter?.(t => t.status === 'arrived') || [];

            if (arrivedTeams.length > prevCountRef.current && prevCountRef.current > 0) {
                const latestTeam = arrivedTeams[arrivedTeams.length - 1];
                setNewTeam(latestTeam);
            }

            setTeams(arrivedTeams);
            prevCountRef.current = arrivedTeams.length;
        } catch (error) {
            console.error('Failed to fetch teams', error);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
        const interval = setInterval(fetchTeams, 3000);
        return () => clearInterval(interval);
    }, [fetchTeams]);

    const handleAnimationComplete = () => setNewTeam(null);

    /* ─── render ─── */
    return (
        <ThemeProvider theme={cyberpunkTheme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#000',
                    color: '#fff',
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
                                backdropFilter: 'blur(24px)',
                                background: 'rgba(6,6,18,0.65)',
                                border: `1px solid ${colors.dark.border}`,
                                borderRadius: 3,
                                px: { xs: 2, md: 4 },
                                py: { xs: 2, md: 3 },
                                mb: { xs: 3, md: 5 },
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* glow strip */}
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 2,
                                    background: `linear-gradient(90deg, transparent, ${colors.neonCyan}, ${colors.neonPink}, transparent)`,
                                }}
                            />
                            <CornerAccent position="tl" />
                            <CornerAccent position="tr" />
                            <CornerAccent position="bl" />
                            <CornerAccent position="br" />

                            <Grid container alignItems="center" spacing={2}>
                                {/* TITLE */}
                                <Grid item xs={12} md={5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Zap size={28} color={colors.neonCyan} style={{ filter: `drop-shadow(0 0 6px ${colors.neonCyan})` }} />
                                        <Box>
                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    fontWeight: 900,
                                                    color: colors.neonCyan,
                                                    textShadow: glowEffects.cyan,
                                                    letterSpacing: 4,
                                                    lineHeight: 1,
                                                    fontSize: { xs: '1.6rem', md: '2.2rem' },
                                                }}
                                            >
                                                IGNITE 2.0
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    opacity: 0.45,
                                                    fontSize: 12,
                                                    letterSpacing: 4,
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                Live Arena Lobby
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* STATS */}
                                <Grid item xs={12} md={7}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                            alignItems: 'center',
                                            gap: { xs: 3, md: 5 },
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Stat label="Teams" value={teams.length} color={colors.neonPink} />
                                        <Stat
                                            label="Members"
                                            value={teams.reduce((a, t) => a + (t.members?.length || 0), 0)}
                                            color={colors.neonPurple}
                                        />
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 0.8,
                                                border: `1px solid ${colors.dark.border}`,
                                                borderRadius: 2,
                                                fontFamily: '"Fira Code", monospace',
                                                fontSize: 14,
                                                letterSpacing: 3,
                                                color: colors.neonCyan,
                                                textShadow: `0 0 8px ${colors.neonCyan}50`,
                                                minWidth: 95,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {clock}
                                        </Box>
                                        <LiveIndicator />
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
                                            initial={{ opacity: 0, y: 50, scale: 0.92 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                            transition={{
                                                delay: index * 0.04,
                                                type: 'spring',
                                                stiffness: 140,
                                                damping: 18,
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 14,
                                    px: 4,
                                    borderRadius: 3,
                                    backdropFilter: 'blur(16px)',
                                    background: 'rgba(6,6,18,0.5)',
                                    border: `1px dashed ${colors.dark.border}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <CornerAccent position="tl" />
                                <CornerAccent position="tr" />
                                <CornerAccent position="bl" />
                                <CornerAccent position="br" />

                                <motion.div
                                    animate={{
                                        scale: [1, 1.15, 1],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <Radio
                                        size={80}
                                        color={colors.neonCyan}
                                        style={{ marginBottom: 20, filter: `drop-shadow(0 0 18px ${colors.neonCyan})` }}
                                    />
                                </motion.div>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: colors.neonCyan,
                                        textShadow: `0 0 16px ${colors.neonCyan}60`,
                                        mb: 1.5,
                                        letterSpacing: 3,
                                    }}
                                >
                                    AWAITING TEAMS
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: colors.neonPurple,
                                        opacity: 0.7,
                                        letterSpacing: 1,
                                    }}
                                >
                                    Teams will materialise here as they check in
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
            </Box>
        </ThemeProvider>
    );
}
