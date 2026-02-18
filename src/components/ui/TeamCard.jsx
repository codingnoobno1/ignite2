'use client';
import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Users, Award, Clock } from 'lucide-react';
import { colors, glowEffects, getStatusColor } from '@/lib/theme';
import StatusBadge from './StatusBadge';

const MotionCard = motion.create(Card);

export default function TeamCard({
    team,
    variant = 'compact',
    animationDelay = 0,
    onClick
}) {
    if (!team) return null;

    const statusColor = getStatusColor(team.status);

    return (
        <MotionCard
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                delay: animationDelay,
                type: 'spring',
                stiffness: 300,
                damping: 25
            }}
            whileHover={{
                scale: 1.05,
                y: -5,
                rotateY: 5,
                transition: { duration: 0.3 }
            }}
            onClick={onClick}
            sx={{
                background: 'rgba(10,10,22,0.55)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: `1px solid rgba(0,229,255,0.12)`,
                borderRadius: 3,
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                    borderColor: `${statusColor}90`,
                    boxShadow: `0 0 24px ${statusColor}30, inset 0 0 24px ${statusColor}08`,
                    background: 'rgba(10,10,22,0.72)',
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                },
                '&:hover::before': {
                    opacity: 1,
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Team Name */}
                <Typography
                    variant="h5"
                    sx={{
                        color: '#fff',
                        fontWeight: 700,
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    {team.name}
                </Typography>

                {/* Track */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Award size={16} color={colors.neonPink} />
                    <Typography
                        variant="body2"
                        sx={{
                            color: colors.neonPink,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                        }}
                    >
                        {team.track}
                    </Typography>
                </Box>

                {/* Status Badge */}
                <Box sx={{ mb: 2 }}>
                    <StatusBadge status={team.status} size="small" />
                </Box>

                {/* Team Info */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {/* Member Count */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Users size={14} color={colors.neonCyan} />
                        <Typography
                            variant="caption"
                            sx={{
                                color: colors.neonCyan,
                                fontWeight: 600,
                            }}
                        >
                            {team.members?.length || 0} Members
                        </Typography>
                    </Box>

                    {/* Round Info */}
                    {team.current_round && (
                        <Chip
                            label={`Round ${team.current_round}`}
                            size="small"
                            sx={{
                                backgroundColor: `${colors.neonPurple}20`,
                                color: colors.neonPurple,
                                border: `1px solid ${colors.neonPurple}`,
                                fontSize: '0.7rem',
                                height: '20px',
                            }}
                        />
                    )}

                    {/* Promoted Badge */}
                    {team.promoted_to_round_2 && (
                        <Chip
                            label="PROMOTED"
                            size="small"
                            sx={{
                                backgroundColor: `${colors.neonGreen}20`,
                                color: colors.neonGreen,
                                border: `1px solid ${colors.neonGreen}`,
                                fontSize: '0.7rem',
                                height: '20px',
                                fontWeight: 700,
                            }}
                        />
                    )}
                </Box>

                {/* Arrival Time (if checked in) */}
                {team.arrival_timestamp && variant === 'detailed' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                        <Clock size={12} color={colors.neonOrange} />
                        <Typography
                            variant="caption"
                            sx={{
                                color: colors.neonOrange,
                                fontSize: '0.7rem',
                            }}
                        >
                            Arrived: {new Date(team.arrival_timestamp).toLocaleTimeString()}
                        </Typography>
                    </Box>
                )}

                {/* Submission Status */}
                {team.submission && variant === 'detailed' && (
                    <Box sx={{ mt: 2 }}>
                        <Chip
                            label="SUBMITTED"
                            size="small"
                            sx={{
                                backgroundColor: `${colors.neonGreen}20`,
                                color: colors.neonGreen,
                                border: `1px solid ${colors.neonGreen}`,
                                fontSize: '0.7rem',
                            }}
                        />
                    </Box>
                )}

                {/* Animated Corner Accent */}
                <motion.div
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '40px',
                        height: '40px',
                        background: `linear-gradient(135deg, transparent 50%, ${statusColor}40 50%)`,
                        pointerEvents: 'none',
                    }}
                />
            </CardContent>
        </MotionCard>
    );
}
