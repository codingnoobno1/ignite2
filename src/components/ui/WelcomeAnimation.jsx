'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Award } from 'lucide-react';
import { colors, glowEffects } from '@/lib/theme';
// Cube component removed for performance
// const CubeCanvas = dynamic(() => import('./Cube'), { ssr: false });

export default function WelcomeAnimation({
    team,
    onDismiss,
    autoHideDuration = 5000
}) {
    useEffect(() => {
        if (autoHideDuration > 0) {
            const timer = setTimeout(() => {
                onDismiss(); // Directly call onDismiss
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [autoHideDuration, onDismiss]);

    if (!team) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(10px)',
            }}
            onClick={onDismiss}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    duration: 0.8
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    maxWidth: '600px',
                    width: '90%',
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={onDismiss}
                    sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        backgroundColor: colors.neonPink,
                        color: '#000',
                        zIndex: 10,
                        '&:hover': {
                            backgroundColor: colors.neonPink,
                            boxShadow: glowEffects.pink,
                            transform: 'scale(1.1)',
                        },
                    }}
                >
                    <X size={24} />
                </IconButton>

                {/* Main Card */}
                <Box
                    sx={{
                        backgroundColor: colors.dark.card,
                        border: `3px solid ${colors.neonCyan}`,
                        boxShadow: glowEffects.cyan,
                        p: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 2,
                    }}
                >
                    {/* Animated Background Pattern */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `
                                linear-gradient(45deg, ${colors.dark.border} 25%, transparent 25%),
                                linear-gradient(-45deg, ${colors.dark.border} 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, ${colors.dark.border} 75%),
                                linear-gradient(-45deg, transparent 75%, ${colors.dark.border} 75%)
                            `,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                            opacity: 0.1,
                        }}
                    />

                    {/* Content */}
                    <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        {/* Icon instead of 3D Cube */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 3,
                            }}
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Users size={80} color={colors.neonCyan} />
                            </motion.div>
                        </Box>

                        {/* Welcome Text */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    textAlign: 'center',
                                    color: colors.neonCyan,
                                    textShadow: glowEffects.cyan,
                                    mb: 2,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                Welcome!
                            </Typography>
                        </motion.div>

                        {/* Team Name */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    textAlign: 'center',
                                    color: '#fff',
                                    mb: 3,
                                    fontWeight: 600,
                                }}
                            >
                                {team.name}
                            </Typography>
                        </motion.div>

                        {/* Team Info */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 4,
                                flexWrap: 'wrap',
                            }}
                        >
                            {/* Track */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        backgroundColor: `${colors.neonPink}20`,
                                        border: `1px solid ${colors.neonPink}`,
                                        px: 2,
                                        py: 1,
                                        boxShadow: glowEffects.pink,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Award size={20} color={colors.neonPink} />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: colors.neonPink,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {team.track}
                                    </Typography>
                                </Box>
                            </motion.div>

                            {/* Member Count */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.9, type: 'spring' }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        backgroundColor: `${colors.neonGreen}20`,
                                        border: `1px solid ${colors.neonGreen}`,
                                        px: 2,
                                        py: 1,
                                        boxShadow: glowEffects.green,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Users size={20} color={colors.neonGreen} />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: colors.neonGreen,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {team.members?.length || 0} Members
                                    </Typography>
                                </Box>
                            </motion.div>
                        </Box>

                        {/* Good Luck Message */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.1 }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    textAlign: 'center',
                                    color: colors.neonPurple,
                                    mt: 3,
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                }}
                            >
                                Good Luck! 🚀
                            </Typography>
                        </motion.div>
                    </Box>
                </Box>
            </motion.div>
        </motion.div>
    );
}
