'use client';
import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { Timer, Play, Pause, RefreshCw } from 'lucide-react';
import { colors, glowEffects } from '@/lib/theme';
import AnimatedButton from '@/components/ui/AnimatedButton';

const TIMER_PRESETS = [15, 30, 45, 60, 90, 120];

const TimerControls = ({
    currentRound,
    timerDuration,
    currentTimer,
    onSetRound,
    onSetTimer,
    onTimerAction,
    fmtTime
}) => {
    return (
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
                                        onClick={() => onSetRound(r)}
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
                                        onClick={() => onSetTimer(m)}
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
                                        <AnimatedButton variant="success" size="small" onClick={() => onTimerAction('start')}>
                                            <Play size={16} />
                                        </AnimatedButton>
                                    ) : (
                                        <AnimatedButton variant="warning" size="small" onClick={() => onTimerAction('pause')}>
                                            <Pause size={16} />
                                        </AnimatedButton>
                                    )}
                                    <AnimatedButton variant="secondary" size="small" onClick={() => onTimerAction('reset')}>
                                        <RefreshCw size={16} />
                                    </AnimatedButton>
                                </Box>
                            </Box>
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TimerControls;
